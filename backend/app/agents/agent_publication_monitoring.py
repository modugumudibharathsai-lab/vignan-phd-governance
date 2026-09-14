from datetime import datetime, date
from typing import Dict, List, Any, Optional
import difflib
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models import (
    Faculty, AuthorIdentifier, AffiliationVariant, Publication, 
    FacultyCitationTrend, Journal
)

class PublicationMonitoringAgent:
    """
    Agent 17: Faculty Research Publication Monitoring Agent
    Maintains a verified, deduplicated record of faculty research outputs,
    linking external author IDs, resolving affiliation variants, detecting
    predatory papers and rapid spikes, and maintaining citation time-series.
    """

    AFFILIATION_VARIANTS_DEFAULT = [
        "Vignan's Foundation for Science, Technology and Research",
        "Vignan's Foundation for Science, Technology & Research (Deemed to be University)",
        "VFSTR Deemed to be University, Vadlamudi, Guntur",
        "VFSTR, Guntur, Andhra Pradesh",
        "Vignan University, Vadlamudi",
        "Department of Computer Science and Engineering, VFSTR",
        "School of Computing and Informatics, Vignan University"
    ]

    def __init__(self, db: Session):
        self.db = db

    def check_affiliation_match(self, raw_affiliation: str) -> bool:
        """
        Resolves whether a raw affiliation matches registered institutional variants.
        """
        variants = self.db.query(AffiliationVariant).filter(AffiliationVariant.is_active == True).all()
        raw_lower = raw_affiliation.lower()
        for v in variants:
            if v.variant_string.lower() in raw_lower or raw_lower in v.variant_string.lower():
                return True
        # Also check core keywords
        if "vignan" in raw_lower or "vfstr" in raw_lower:
            return True
        return False

    def deduplicate_and_attribute(self, candidate: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deduplicates against existing database by DOI first, then fuzzy title match.
        Attributes to correct faculty or flags as ambiguous.
        """
        doi = candidate.get("doi")
        title = candidate.get("title", "").strip()
        faculty_id = candidate.get("faculty_id")

        # 1. Check exact DOI match
        if doi:
            existing_doi = self.db.query(Publication).filter(Publication.doi == doi).first()
            if existing_doi:
                return {
                    "action": "DUPLICATE_DOI",
                    "existing_id": existing_doi.id,
                    "doi": doi,
                    "title": existing_doi.title,
                    "message": "Exact DOI match found in repository. Record already tracked."
                }

        # 2. Check title similarity
        all_pubs = self.db.query(Publication).all()
        for p in all_pubs:
            ratio = difflib.SequenceMatcher(None, title.lower(), p.title.lower()).ratio()
            if ratio >= 0.88: # 88%+ text similarity
                return {
                    "action": "DUPLICATE_TITLE_SIMILARITY",
                    "similarity_pct": round(ratio * 100, 1),
                    "existing_id": p.id,
                    "title": p.title,
                    "message": f"High fuzzy match ({round(ratio*100, 1)}%) with existing publication id #{p.id}."
                }

        # 3. Check author attribution
        if not faculty_id:
            # Try to auto-match author name in author string
            authors = candidate.get("authors", "")
            faculty_list = self.db.query(Faculty).all()
            matched_faculty = []
            for f in faculty_list:
                name_parts = f.name.replace("Dr.", "").replace("Dr ", "").strip().split()
                if any(part.lower() in authors.lower() for part in name_parts if len(part) > 3):
                    matched_faculty.append(f)

            if len(matched_faculty) == 1:
                faculty_id = matched_faculty[0].id
                status = "Verified"
            elif len(matched_faculty) > 1:
                faculty_id = matched_faculty[0].id
                status = "Ambiguous" # Needs manual confirmation
            else:
                status = "Ambiguous"
        else:
            status = "Verified"

        return {
            "action": "ACCEPTED",
            "faculty_id": faculty_id,
            "status": status,
            "message": "Publication unique and ready for ingestion."
        }

    def detect_predatory_and_anomalies(self, journal_name: str, issn: Optional[str] = None, faculty_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Screens journal against known delisted/predatory characteristics and detects
        unusually rapid faculty publication velocity (>3 papers in a single 30-day window).
        """
        is_predatory = False
        reasons = []

        # Check in Journal database
        journal = None
        if issn:
            journal = self.db.query(Journal).filter(
                (Journal.canonical_issn == issn) | (Journal.e_issn == issn)
            ).first()
        if not journal and journal_name:
            journal = self.db.query(Journal).filter(Journal.title.ilike(f"%{journal_name}%")).first()

        if journal:
            if journal.is_delisted:
                is_predatory = True
                reasons.append(f"Journal was delisted from Scopus/WoS: {journal.delisted_reason or 'Quality concerns'}")
            if journal.predatory_risk_score >= 50:
                is_predatory = True
                reasons.append(f"High predatory risk index ({journal.predatory_risk_score}/100) due to questionable peer review practices.")
        else:
            # Generic heuristic checks on journal name
            questionable_keywords = ["universal", "instant publish", "rapid research", "fast review", "international journal of recent advances in all fields"]
            for kw in questionable_keywords:
                if kw in journal_name.lower():
                    is_predatory = True
                    reasons.append(f"Questionable publisher profile detected matching keyword: '{kw}'")

        # Velocity check: if faculty published >= 3 papers in last month
        if faculty_id:
            recent_count = self.db.query(Publication).filter(
                Publication.faculty_id == faculty_id,
                Publication.created_at >= datetime.utcnow().replace(day=1)
            ).count()
            if recent_count >= 3:
                reasons.append(f"Unusually rapid publication pattern: Faculty member has logged {recent_count + 1} papers in the current reporting cycle.")

        return {
            "is_flagged": is_predatory or len(reasons) > 0,
            "reasons": reasons,
            "journal_found": bool(journal),
            "quartile": journal.jcr_quartile if journal else "Unranked",
            "impact_factor": journal.impact_factor if journal else 0.0
        }

    def run_automated_sweep(self) -> Dict[str, Any]:
        """
        Simulates scheduled monthly polling cycle across Scopus, Web of Science, 
        and Google Scholar, updating verification queues and citation growth.
        """
        faculty_members = self.db.query(Faculty).all()
        total_sweeped = 0
        new_citations = 0

        for f in faculty_members:
            # Update last sweep timestamp on author identifiers
            if f.identifiers:
                f.identifiers.last_sweep_at = datetime.utcnow()

            # Increment citation counts slightly to simulate realistic citation velocity
            pubs = self.db.query(Publication).filter(Publication.faculty_id == f.id).all()
            total_citations = sum(p.citations_count for p in pubs)
            
            # Compute h-index
            sorted_cites = sorted([p.citations_count for p in pubs], reverse=True)
            h = 0
            for idx, c in enumerate(sorted_cites):
                if c >= idx + 1:
                    h = idx + 1
                else:
                    break
            
            # Record trend entry
            current_year = date.today().year
            trend = self.db.query(FacultyCitationTrend).filter(
                FacultyCitationTrend.faculty_id == f.id,
                FacultyCitationTrend.record_year == current_year
            ).first()
            if not trend:
                trend = FacultyCitationTrend(
                    faculty_id=f.id,
                    record_year=current_year,
                    total_publications=len(pubs),
                    total_citations=total_citations,
                    h_index=h,
                    i10_index=sum(1 for c in sorted_cites if c >= 10)
                )
                self.db.add(trend)
            else:
                trend.total_publications = len(pubs)
                trend.total_citations = total_citations
                trend.h_index = h
                trend.i10_index = sum(1 for c in sorted_cites if c >= 10)

            total_sweeped += 1

        self.db.commit()

        return {
            "status": "Sweep completed successfully",
            "faculty_checked": total_sweeped,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "Author registers polled and citation time-series updated."
        }

    def get_accreditation_evidence_export(self) -> List[Dict[str, Any]]:
        """
        Formats verified publications into an accreditation-ready NIRF/NAAC data export.
        """
        pubs = self.db.query(Publication).filter(
            Publication.is_verified == True,
            Publication.is_flagged_predatory == False
        ).order_by(Publication.publication_year.desc()).all()

        evidence = []
        for p in pubs:
            evidence.append({
                "sl_no": len(evidence) + 1,
                "title": p.title,
                "authors": p.authors,
                "faculty_member": p.faculty.name if p.faculty else "Independent Scholar",
                "department": p.faculty.department.name if (p.faculty and p.faculty.department) else "CSE",
                "journal_name": p.journal_name,
                "issn": p.issn,
                "publication_year": p.publication_year,
                "quartile": p.quartile,
                "indexing": "Scopus & WoS" if (p.scopus_indexed and p.wos_indexed) else ("Scopus" if p.scopus_indexed else "WoS"),
                "citations": p.citations_count,
                "doi": p.doi or "N/A",
                "evidence_status": "Accreditation Verified"
            })
        return evidence
