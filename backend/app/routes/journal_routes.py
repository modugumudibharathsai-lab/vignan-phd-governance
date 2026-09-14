from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.agents.agent_journal_quartile import JournalQuartileAgent

router = APIRouter(prefix="/journals", tags=["Agent 18: Journal Quartile Verification Agent"])

@router.get("/verify")
def verify_journal_endpoint(
    query: str = Query(..., description="Journal Title or ISSN (e.g. 2168-2267 or 'Pattern Recognition')"),
    db: Session = Depends(get_db)
):
    agent = JournalQuartileAgent(db)
    result = agent.verify_journal(query)
    return result

@router.get("/approved-list")
def get_approved_journals(db: Session = Depends(get_db)):
    agent = JournalQuartileAgent(db)
    return agent.get_approved_venue_list()
