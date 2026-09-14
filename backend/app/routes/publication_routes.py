from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Publication, Faculty, AuthorIdentifier, AffiliationVariant
from backend.app.agents.agent_publication_monitoring import PublicationMonitoringAgent
from backend.app.schemas.api_schemas import PublicationCandidate

router = APIRouter(prefix="/publications", tags=["Agent 17: Faculty Publication Monitoring Agent"])

@router.get("/")
def list_publications(
    faculty_id: Optional[int] = None,
    scholar_id: Optional[int] = None,
    quartile: Optional[str] = None,
    verified_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Publication)
    if faculty_id:
        query = query.filter(Publication.faculty_id == faculty_id)
    if scholar_id:
        query = query.filter(Publication.scholar_id == scholar_id)
    if quartile:
        query = query.filter(Publication.quartile == quartile)
    if verified_only:
        query = query.filter(Publication.is_verified == True)
    if search:
        s = f"%{search}%"
        query = query.filter((Publication.title.ilike(s)) | (Publication.authors.ilike(s)) | (Publication.journal_name.ilike(s)))

    pubs = query.order_by(Publication.publication_year.desc()).all()
    return [
        {
            "id": p.id,
            "doi": p.doi,
            "title": p.title,
            "authors": p.authors,
            "faculty_name": p.faculty.name if p.faculty else None,
            "scholar_name": p.scholar.name if p.scholar else None,
            "journal_name": p.journal_name,
            "issn": p.issn,
            "year": p.publication_year,
            "type": p.publication_type,
            "quartile": p.quartile,
            "scopus_indexed": p.scopus_indexed,
            "wos_indexed": p.wos_indexed,
            "citations": p.citations_count,
            "is_verified": p.is_verified,
            "status": p.verification_status,
            "is_flagged_predatory": p.is_flagged_predatory,
            "flagged_reason": p.flagged_reason
        }
        for p in pubs
    ]

@router.post("/ingest")
def ingest_publication(payload: PublicationCandidate, db: Session = Depends(get_db)):
    agent = PublicationMonitoringAgent(db)
    
    # 1. Deduplication check
    candidate_dict = payload.dict()
    dedup_res = agent.deduplicate_and_attribute(candidate_dict)
    if dedup_res["action"] in ["DUPLICATE_DOI", "DUPLICATE_TITLE_SIMILARITY"]:
        return {"status": "Duplicate Detected", "details": dedup_res}

    # 2. Predatory and anomaly check
    pred_res = agent.detect_predatory_and_anomalies(payload.journal_name, payload.issn, payload.faculty_id)

    # 3. Create publication
    new_pub = Publication(
        doi=payload.doi,
        title=payload.title,
        authors=payload.authors,
        faculty_id=dedup_res.get("faculty_id") or payload.faculty_id,
        scholar_id=payload.scholar_id,
        journal_name=payload.journal_name,
        issn=payload.issn,
        publication_year=payload.publication_year,
        publication_type=payload.publication_type,
        is_scholar_first_or_corresponding=payload.is_scholar_first_or_corresponding,
        quartile=pred_res.get("quartile", "Unranked"),
        scopus_indexed=True if not pred_res.get("is_flagged") else False,
        wos_indexed=True if not pred_res.get("is_flagged") else False,
        citations_count=0,
        is_verified=not pred_res.get("is_flagged") and dedup_res.get("status") == "Verified",
        verification_status="Flagged" if pred_res.get("is_flagged") else dedup_res.get("status", "Verified"),
        is_flagged_predatory=pred_res.get("is_flagged", False),
        flagged_reason="; ".join(pred_res.get("reasons", [])) if pred_res.get("reasons") else None
    )
    db.add(new_pub)
    db.commit()

    return {
        "status": "Processed",
        "publication_id": new_pub.id,
        "verification_status": new_pub.verification_status,
        "deduplication": dedup_res,
        "anomaly_screening": pred_res
    }

@router.post("/sweep")
def trigger_external_sweep(db: Session = Depends(get_db)):
    agent = PublicationMonitoringAgent(db)
    return agent.run_automated_sweep()

@router.get("/flagged-queue")
def get_flagged_queue(db: Session = Depends(get_db)):
    pubs = db.query(Publication).filter(
        (Publication.is_flagged_predatory == True) | 
        (Publication.verification_status.in_(["Flagged", "Ambiguous"]))
    ).all()
    return [
        {
            "id": p.id,
            "doi": p.doi,
            "title": p.title,
            "authors": p.authors,
            "faculty": p.faculty.name if p.faculty else "Unassigned",
            "journal": p.journal_name,
            "quartile": p.quartile,
            "reason": p.flagged_reason or "Ambiguous author attribution requires confirmation",
            "status": p.verification_status
        }
        for p in pubs
    ]

@router.get("/accreditation-export")
def export_accreditation_evidence(db: Session = Depends(get_db)):
    agent = PublicationMonitoringAgent(db)
    return agent.get_accreditation_evidence_export()

@router.get("/author-register")
def get_author_register(db: Session = Depends(get_db)):
    faculty = db.query(Faculty).all()
    roster = []
    for f in faculty:
        ident = f.identifiers
        roster.append({
            "faculty_id": f.id,
            "name": f.name,
            "department": f.department.name if f.department else "CSE",
            "designation": f.designation,
            "email": f.email,
            "scopus_author_id": ident.scopus_author_id if ident else None,
            "orcid_id": ident.orcid_id if ident else None,
            "wos_researcher_id": ident.wos_researcher_id if ident else None,
            "last_sweep_at": ident.last_sweep_at.isoformat() if (ident and ident.last_sweep_at) else None
        })
    return roster

@router.get("/affiliation-variants")
def get_affiliation_variants(db: Session = Depends(get_db)):
    variants = db.query(AffiliationVariant).all()
    return [
        {"id": v.id, "canonical_name": v.canonical_name, "variant_string": v.variant_string, "is_active": v.is_active}
        for v in variants
    ]

@router.post("/{id}/verify")
def confirm_publication(id: int, action: str = Query(..., enum=["Approve", "Reject"]), db: Session = Depends(get_db)):
    pub = db.query(Publication).filter(Publication.id == id).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    if action == "Approve":
        pub.is_verified = True
        pub.verification_status = "Verified"
        pub.is_flagged_predatory = False
        pub.flagged_reason = None
    else:
        pub.is_verified = False
        pub.verification_status = "Rejected"

    db.commit()
    return {"message": f"Publication id #{id} status updated to {pub.verification_status}."}
