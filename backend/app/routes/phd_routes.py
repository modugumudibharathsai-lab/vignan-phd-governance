from typing import Optional, List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import PhDScholar, PhDMilestone, DoctoralCommittee, DoctoralCommitteeReview
from backend.app.agents.agent_phd_monitoring import PhDMonitoringAgent
from backend.app.schemas.api_schemas import MilestoneUpdate, DCReviewCreate

router = APIRouter(prefix="/phd", tags=["Agent 25: PhD Monitoring Agent"])

@router.get("/scholars")
def get_scholars(
    search: Optional[str] = None,
    area: Optional[str] = None,
    year: Optional[int] = None,
    supervisor_id: Optional[int] = None,
    status: Optional[str] = None,
    mode: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PhDScholar)
    if search:
        s_clean = f"%{search}%"
        query = query.filter(
            (PhDScholar.name.ilike(s_clean)) | 
            (PhDScholar.reg_no.ilike(s_clean)) |
            (PhDScholar.research_area.ilike(s_clean))
        )
    if area:
        query = query.filter(PhDScholar.research_area.ilike(f"%{area}%"))
    if year:
        query = query.filter(PhDScholar.admission_year == year)
    if supervisor_id:
        query = query.filter(PhDScholar.supervisor_id == supervisor_id)
    if status:
        query = query.filter(PhDScholar.current_status == status)
    if mode:
        query = query.filter(PhDScholar.mode == mode)

    scholars = query.order_by(PhDScholar.admission_year.asc(), PhDScholar.reg_no.asc()).all()
    
    results = []
    for s in scholars:
        completed_m = sum(1 for m in s.milestones if m.status == "Completed")
        total_m = len(s.milestones)
        progress_pct = round((completed_m / max(1, total_m)) * 100, 1)

        results.append({
            "id": s.id,
            "reg_no": s.reg_no,
            "name": s.name,
            "email": s.email,
            "phone": s.phone,
            "admission_year": s.admission_year,
            "mode": s.mode,
            "research_area": s.research_area,
            "current_status": s.current_status,
            "registration_date": s.registration_date.isoformat(),
            "min_duration_date": s.min_duration_date.isoformat(),
            "max_duration_date": s.max_duration_date.isoformat(),
            "is_stalled": s.is_stalled,
            "stalled_reason": s.stalled_reason,
            "publication_requirement_met": s.publication_requirement_met,
            "cumulative_research_points": s.cumulative_research_points or 0.0,
            "tier1_publication_met": s.tier1_publication_met or False,
            "submission_eligibility_status": s.submission_eligibility_status or "Pending",
            "supervisor": {
                "id": s.supervisor.id if s.supervisor else None,
                "name": s.supervisor.name if s.supervisor else "Unassigned",
                "designation": s.supervisor.designation if s.supervisor else None,
                "email": s.supervisor.email if s.supervisor else None
            },
            "milestone_progress": {
                "completed": completed_m,
                "total": total_m,
                "percentage": progress_pct
            }
        })
    return {"count": len(results), "scholars": results}

@router.get("/scholars/{id}")
def get_scholar_detail(id: int, db: Session = Depends(get_db)):
    scholar = db.query(PhDScholar).filter(PhDScholar.id == id).first()
    if not scholar:
        raise HTTPException(status_code=404, detail="Scholar not found")

    agent = PhDMonitoringAgent(db)
    pub_check = agent.verify_publication_eligibility(scholar.id)

    milestones_sorted = sorted(scholar.milestones, key=lambda m: m.sequence_order)
    dc = scholar.dc_committee

    return {
        "id": scholar.id,
        "reg_no": scholar.reg_no,
        "name": scholar.name,
        "email": scholar.email,
        "phone": scholar.phone,
        "admission_year": scholar.admission_year,
        "mode": scholar.mode,
        "research_area": scholar.research_area,
        "current_status": scholar.current_status,
        "registration_date": scholar.registration_date.isoformat(),
        "min_duration_date": scholar.min_duration_date.isoformat(),
        "max_duration_date": scholar.max_duration_date.isoformat(),
        "is_stalled": scholar.is_stalled,
        "stalled_reason": scholar.stalled_reason,
        "cumulative_research_points": scholar.cumulative_research_points,
        "tier1_publication_met": scholar.tier1_publication_met,
        "submission_eligibility_status": scholar.submission_eligibility_status,
        "supervisor": {
            "id": scholar.supervisor.id if scholar.supervisor else None,
            "name": scholar.supervisor.name if scholar.supervisor else "Unassigned",
            "designation": scholar.supervisor.designation if scholar.supervisor else None,
            "department": scholar.supervisor.department.name if (scholar.supervisor and scholar.supervisor.department) else "CSE",
            "email": scholar.supervisor.email if scholar.supervisor else None,
            "phone": scholar.supervisor.phone if scholar.supervisor else None
        },
        "doctoral_committee": {
            "chairman_name": dc.chairman_name if dc else None,
            "chairman_dept": dc.chairman_dept if dc else None,
            "chairman_email": dc.chairman_email if dc else None,
            "hod_nominee_name": dc.hod_nominee_name if dc else None,
            "hod_nominee_dept": dc.hod_nominee_dept if dc else None,
            "external_expert_name": dc.external_expert_name if dc else None,
            "external_expert_affiliation": dc.external_expert_affiliation if dc else None,
            "external_expert_email": dc.external_expert_email if dc else None,
            "internal_expert1_name": dc.internal_expert1_name if dc else None,
            "internal_expert1_dept": dc.internal_expert1_dept if dc else None,
            "internal_expert1_email": dc.internal_expert1_email if dc else None,
            "internal_expert2_name": dc.internal_expert2_name if dc else None,
            "internal_expert2_dept": dc.internal_expert2_dept if dc else None,
            "interschool_nominee_name": dc.interschool_nominee_name if dc else None,
            "interschool_nominee_dept": dc.interschool_nominee_dept if dc else None,
            "constituted_date": dc.constituted_date.isoformat() if (dc and dc.constituted_date) else None
        },
        "milestones": [
            {
                "id": m.id,
                "code": m.milestone_code,
                "name": m.name,
                "order": m.sequence_order,
                "status": m.status,
                "due_date": m.due_date.isoformat(),
                "completion_date": m.completion_date.isoformat() if m.completion_date else None,
                "notes": m.notes
            }
            for m in milestones_sorted
        ],
        "publication_eligibility": pub_check
    }

@router.get("/supervisor-capacities")
def get_supervisor_capacities(db: Session = Depends(get_db)):
    agent = PhDMonitoringAgent(db)
    return agent.check_supervisor_capacities()

@router.get("/scholars/{id}/publication-eligibility")
def check_publication_eligibility(id: int, db: Session = Depends(get_db)):
    agent = PhDMonitoringAgent(db)
    return agent.verify_publication_eligibility(id)

@router.get("/duration-compliance")
def get_duration_compliance(db: Session = Depends(get_db)):
    agent = PhDMonitoringAgent(db)
    return agent.evaluate_duration_and_stalled_scholars()

@router.get("/dashboard")
def get_phd_dashboard(db: Session = Depends(get_db)):
    agent = PhDMonitoringAgent(db)
    return agent.get_progress_dashboard()

@router.post("/scholars/{id}/milestones/{code}/complete")
def complete_milestone(id: int, code: str, payload: MilestoneUpdate, db: Session = Depends(get_db)):
    milestone = db.query(PhDMilestone).filter(
        PhDMilestone.scholar_id == id,
        PhDMilestone.milestone_code == code
    ).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found for this scholar")

    # Enforce strict dual-condition rule if advancing to Pre-Submission, Synopsis, or Thesis
    if code in ["PRE_SUB", "SYN", "THESIS", "PUB_REQ"] and payload.status == "Completed":
        agent = PhDMonitoringAgent(db)
        eval_res = agent.verify_publication_eligibility(id)
        if not eval_res.get("is_eligible_for_submission"):
            raise HTTPException(
                status_code=400,
                detail=f"PhD Submission Blocked: {eval_res.get('status_message')}"
            )

    milestone.status = payload.status
    milestone.completion_date = payload.completion_date or date.today()
    if payload.notes:
        milestone.notes = payload.notes
    db.commit()

    return {"message": f"Milestone {milestone.name} marked as {payload.status}.", "milestone_id": milestone.id}

@router.get("/export-json")
def export_scholars_json():
    import os
    json_path = os.path.join(os.getcwd(), "vignan_phd_scholars_data.json")
    if not os.path.exists(json_path):
        json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "vignan_phd_scholars_data.json")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="JSON export file not found")
    return FileResponse(
        json_path,
        media_type="application/json",
        filename="vignan_phd_scholars_data.json"
    )
