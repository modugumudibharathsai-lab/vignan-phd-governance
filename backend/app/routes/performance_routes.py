from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import AppraisalRubric, AppraisalDossier
from backend.app.agents.agent_faculty_performance import FacultyPerformanceAgent
from backend.app.schemas.api_schemas import ContestationCreate, HoDReviewSubmit

router = APIRouter(prefix="/performance", tags=["Agent 59: Faculty Performance Agent"])

@router.get("/dossier/{faculty_id}")
def get_faculty_dossier(faculty_id: int, year: str = "2024-25", db: Session = Depends(get_db)):
    agent = FacultyPerformanceAgent(db)
    result = agent.auto_populate_dossier(faculty_id, year)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/rubric")
def get_appraisal_rubric(db: Session = Depends(get_db)):
    rubric = db.query(AppraisalRubric).filter(AppraisalRubric.is_active == True).first()
    if not rubric:
        return FacultyPerformanceAgent.DEFAULT_RUBRIC
    return {
        "version": rubric.version_name,
        "effective_year": rubric.effective_from_year,
        "weights": {
            "teaching": rubric.teaching_weight,
            "research": rubric.research_weight,
            "governance": rubric.governance_weight,
            "outreach": rubric.outreach_weight
        }
    }

@router.get("/hod-brief/{faculty_id}")
def get_hod_appraisal_brief(faculty_id: int, year: str = "2024-25", db: Session = Depends(get_db)):
    agent = FacultyPerformanceAgent(db)
    return agent.generate_hod_brief(faculty_id, year)

@router.post("/contestation")
def submit_contestation(payload: ContestationCreate, db: Session = Depends(get_db)):
    agent = FacultyPerformanceAgent(db)
    res = agent.submit_contestation(payload.dossier_id, payload.reason, payload.evidence_url)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@router.post("/dossier/{id}/hod-review")
def record_hod_review(id: int, payload: HoDReviewSubmit, db: Session = Depends(get_db)):
    dossier = db.query(AppraisalDossier).filter(AppraisalDossier.id == id).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier not found")
    dossier.hod_comments = payload.hod_comments
    if payload.agreed_next_cycle_goals:
        dossier.agreed_next_cycle_goals = payload.agreed_next_cycle_goals
    dossier.status = "HoD_Reviewed"
    db.commit()
    return {"message": "HoD appraisal review submitted successfully.", "status": dossier.status}
