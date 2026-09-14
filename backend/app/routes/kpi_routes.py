from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.agents.agent_university_kpi import UniversityKPIAgent

router = APIRouter(prefix="/kpis", tags=["Agent 71: University Key Performance Indicator Agent"])

@router.get("/cockpit")
def get_kpi_cockpit(db: Session = Depends(get_db)):
    agent = UniversityKPIAgent(db)
    return agent.get_governance_cockpit()

@router.post("/sync")
def sync_live_kpis(db: Session = Depends(get_db)):
    agent = UniversityKPIAgent(db)
    return agent.sync_live_indicators()

@router.get("/lead-lag-correlations")
def get_correlations(db: Session = Depends(get_db)):
    agent = UniversityKPIAgent(db)
    return agent.get_lead_lag_correlations()

@router.get("/governance-brief")
def get_governance_brief(db: Session = Depends(get_db)):
    agent = UniversityKPIAgent(db)
    return agent.export_governance_brief()
