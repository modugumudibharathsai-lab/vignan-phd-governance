from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Faculty
from backend.app.agents.agent_research_productivity import ResearchProductivityAgent

router = APIRouter(prefix="/productivity", tags=["Agent 20: Research Productivity Agent"])

@router.get("/faculty/{id}")
def get_faculty_productivity_scorecard(id: int, year: str = "2024-25", db: Session = Depends(get_db)):
    agent = ResearchProductivityAgent(db)
    card = agent.compute_faculty_scorecard(id, year)
    if "error" in card:
        raise HTTPException(status_code=404, detail=card["error"])
    return card

@router.get("/scorecards")
def get_all_productivity_scorecards(year: str = "2024-25", db: Session = Depends(get_db)):
    agent = ResearchProductivityAgent(db)
    faculty = db.query(Faculty).all()
    scorecards = [agent.compute_faculty_scorecard(f.id, year) for f in faculty]
    return scorecards

@router.get("/department-benchmarks")
def get_department_benchmarks_and_gini(db: Session = Depends(get_db)):
    agent = ResearchProductivityAgent(db)
    return agent.compute_department_benchmarking_and_gini()

@router.get("/recognition-and-support")
def get_recognition_and_support_lists(db: Session = Depends(get_db)):
    agent = ResearchProductivityAgent(db)
    return agent.get_recognition_and_support_lists()
