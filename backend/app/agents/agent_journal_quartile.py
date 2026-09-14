from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models import Journal

class JournalQuartileAgent:
    """
    Agent 18: Journal Quartile Verification Agent
    Verifies indexing status, quartile quality tier (JCR & CiteScore),
    and predatory risk indicators for journals and conferences before submission,
    providing actionable recommendations and reputable peer alternatives.
    """

    CACHE_VALIDITY_DAYS = 90

    def __init__(self, db: Session):
        self.db = db

    def verify_journal(self, query: str) -> Dict[str, Any]:
        """
        Resolves query (ISSN or partial title) to canonical journal record,
        checks indexing, quartiles, predatory indicators, and alternatives.
        """
        query_clean = query.strip()
        journal = None

        # 1. Try ISSN match
        journal = self.db.query(Journal).filter(
            (Journal.canonical_issn == query_clean) | (Journal.e_issn == query_clean)
        ).first()

        # 2. Try Title search if not found by ISSN
        if not journal:
            journal = self.db.query(Journal).filter(Journal.title.ilike(f"%{query_clean}%")).first()

        if not journal:
            return {
                "found": False,
                "query": query,
                "verdict": "Unverified / Not in Master Index",
                "recommendation": "Manual Dean/IQAC scrutiny required before submission.",
                "evidence": [f"No canonical record found matching '{query_clean}' in Scopus, WoS, or UGC-CARE rosters."],
                "alternatives": self.get_top_alternatives("Computer Science & AI")
            }

        # Check Cache validity
        now = datetime.utcnow()
        cache_age_days = (now - journal.last_verified_at).days if journal.last_verified_at else 0
        is_cache_stale = cache_age_days > self.CACHE_VALIDITY_DAYS

        # Predatory and risk evaluation
        risk_factors = []
        if journal.is_delisted:
            risk_factors.append(f"DELISTED ALERT: {journal.delisted_reason or 'Removed by indexing authority'}")
        if journal.predatory_risk_score >= 50:
            risk_factors.append(f"High predatory risk index: {journal.predatory_risk_score}/100")
        if journal.peer_review_weeks and journal.peer_review_weeks < 3:
            risk_factors.append("Unrealistically rapid peer-review timeline (< 3 weeks) advertised")

        # Determine Verdict
        if journal.is_delisted or journal.predatory_risk_score >= 60:
            verdict = "Rejected - Predatory / Delisted"
            badge = "REJECTED"
            recommendation = "DO NOT SUBMIT. Publication in this venue will not be counted for PhD or faculty appraisal credit."
        elif risk_factors or journal.jcr_quartile in ["Q4", "Unranked"]:
            verdict = "Caution - Scrutiny Required"
            badge = "CAUTION"
            recommendation = "Proceed with caution. Discuss with Doctoral Committee / Dean of Research before manuscript submission."
        elif journal.jcr_quartile == "Q1":
            verdict = "Approved - Tier 1 Premier Venue"
            badge = "APPROVED_TIER_1"
            recommendation = "Highly Recommended. Eligible for full doctoral requirement fulfillment and maximum appraisal incentive."
        else:
            verdict = "Approved - Tier 2 Standard Venue"
            badge = "APPROVED_TIER_2"
            recommendation = "Approved. Meets institutional accreditation and PhD publication eligibility requirements."

        # Fetch Alternative journals if flagged or lower quartile
        alternatives = []
        if journal.is_delisted or journal.predatory_risk_score >= 40 or journal.jcr_quartile in ["Q3", "Q4", "Unranked"]:
            alternatives = self.get_top_alternatives(journal.subject_category)

        return {
            "found": True,
            "journal_id": journal.id,
            "title": journal.title,
            "canonical_issn": journal.canonical_issn,
            "e_issn": journal.e_issn,
            "publisher": journal.publisher,
            "subject_category": journal.subject_category,
            "indexing": {
                "wos_indexed": journal.wos_indexed,
                "scopus_indexed": journal.scopus_indexed,
                "ugc_care_indexed": journal.ugc_care_indexed
            },
            "quartiles": {
                "jcr_wos": journal.jcr_quartile,
                "citescore_scopus": journal.citescore_quartile
            },
            "metrics": {
                "impact_factor": journal.impact_factor,
                "citescore": journal.citescore,
                "sjr": journal.sjr,
                "acceptance_rate_pct": journal.acceptance_rate,
                "peer_review_turnaround_weeks": journal.peer_review_weeks
            },
            "verdict": verdict,
            "verdict_badge": badge,
            "recommendation": recommendation,
            "risk_evidence": risk_factors,
            "alternatives": alternatives,
            "verification_timestamp": journal.last_verified_at.isoformat() if journal.last_verified_at else now.isoformat(),
            "cache_validity_days_remaining": max(0, self.CACHE_VALIDITY_DAYS - cache_age_days),
            "is_cache_stale": is_cache_stale,
            "guardrail_notice": "Guardrail active: Verification timestamp must be prominently verified. Indexing statuses are subject to monthly indexer changes."
        }

    def get_top_alternatives(self, subject_category: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Suggests top reputable Q1/Q2 alternative journals in the requested field.
        """
        category = subject_category or "Computer Science & AI"
        query = self.db.query(Journal).filter(
            Journal.is_delisted == False,
            Journal.predatory_risk_score < 15,
            Journal.jcr_quartile.in_(["Q1", "Q2"])
        )
        if subject_category:
            query = query.filter(Journal.subject_category == category)
        
        candidates = query.order_by(Journal.impact_factor.desc()).limit(3).all()
        if not candidates:
            candidates = self.db.query(Journal).filter(
                Journal.is_delisted == False,
                Journal.jcr_quartile == "Q1"
            ).order_by(Journal.impact_factor.desc()).limit(3).all()

        return [
            {
                "id": c.id,
                "title": c.title,
                "issn": c.canonical_issn,
                "publisher": c.publisher,
                "quartile": c.jcr_quartile,
                "impact_factor": c.impact_factor,
                "citescore": c.citescore
            }
            for c in candidates
        ]

    def get_approved_venue_list(self) -> List[Dict[str, Any]]:
        """
        Returns the institutional approved list of vetted venues.
        """
        approved = self.db.query(Journal).filter(
            Journal.is_delisted == False,
            Journal.predatory_risk_score <= 20
        ).order_by(Journal.jcr_quartile.asc(), Journal.impact_factor.desc()).all()

        return [
            {
                "id": j.id,
                "title": j.title,
                "issn": j.canonical_issn,
                "publisher": j.publisher,
                "jcr_quartile": j.jcr_quartile,
                "citescore_quartile": j.citescore_quartile,
                "impact_factor": j.impact_factor,
                "citescore": j.citescore,
                "subject": j.subject_category
            }
            for j in approved
        ]
