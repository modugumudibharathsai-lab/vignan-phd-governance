from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Faculty, PhDScholar

router = APIRouter(prefix="/auth", tags=["Role-Based Personas"])

@router.get("/personas")
def get_personas(db: Session = Depends(get_db)):
    # Key anchor personas
    vc = db.query(Faculty).filter(Faculty.name.ilike("%Nagabhushan%")).first()
    dean = db.query(Faculty).filter(Faculty.name.ilike("%Phani Kumar%")).first()
    hod = db.query(Faculty).filter(Faculty.name.ilike("%Krishna Kishore%")).first()
    faculty_rep = db.query(Faculty).filter(Faculty.name.ilike("%Nirupama Bhat%")).first()
    scholar_rep = db.query(PhDScholar).filter(PhDScholar.reg_no == "221FG04001").first() # Uttej Kumar
    
    return [
        {
            "role_id": "vice_chancellor",
            "role_title": "Vice Chancellor & IQAC Director",
            "user_name": vc.name if vc else "Dr. P. Nagabhushan",
            "entity_id": vc.id if vc else 1,
            "department": "Executive Leadership",
            "badge": "Leadership",
            "description": "Full access to Agent 71 University KPI Cockpit, NIRF/NAAC forecasts, and institutional productivity benchmarks."
        },
        {
            "role_id": "dean_research",
            "role_title": "Dean of Research & Research Section",
            "user_name": dean.name if dean else "Dr. S. V. Phani Kumar",
            "entity_id": dean.id if dean else 2,
            "department": "Research Deanery",
            "badge": "Research Dean",
            "description": "Full supervisory oversight of Agent 25 PhD scholars, supervisor capacity limits, Agent 17 sweeps, and Agent 20 Gini analysis."
        },
        {
            "role_id": "hod",
            "role_title": "Head of Department (HoD, CSE)",
            "user_name": hod.name if hod else "Dr. K. V. Krishna Kishore",
            "entity_id": hod.id if hod else 3,
            "department": "Computer Science & Engineering",
            "badge": "Department Head",
            "description": "Departmental PhD scholar milestones, DC committee reviews, and Agent 59 Faculty Appraisal evaluation briefs."
        },
        {
            "role_id": "faculty_supervisor",
            "role_title": "Doctoral Supervisor & Faculty",
            "user_name": faculty_rep.name if faculty_rep else "Dr. M. Nirupama Bhat",
            "entity_id": faculty_rep.id if faculty_rep else 4,
            "department": "Computer Science & Engineering",
            "badge": "Faculty",
            "description": "Guided doctoral scholars tracker, Agent 18 Journal pre-submission risk scanner, and Agent 59 auto-populated appraisal dossier."
        },
        {
            "role_id": "phd_scholar",
            "role_title": "Doctoral Scholar (PhD Candidate)",
            "user_name": scholar_rep.name if scholar_rep else "Uttej Kumar Nannapaneni",
            "entity_id": scholar_rep.id if scholar_rep else 19,
            "reg_no": scholar_rep.reg_no if scholar_rep else "221FG04001",
            "department": "Computer Science & Engineering",
            "badge": "Scholar",
            "description": "Personal PhD journey roadmap, regulatory milestone countdowns, and Agent 17/18 publication eligibility audit."
        }
    ]
