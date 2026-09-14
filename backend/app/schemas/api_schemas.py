from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime

class MilestoneUpdate(BaseModel):
    completion_date: Optional[date] = None
    notes: Optional[str] = None
    status: str = "Completed"

class DCReviewCreate(BaseModel):
    review_number: int
    scheduled_date: date
    conducted_date: Optional[date] = None
    outcome: str = "Satisfactory"
    minutes_summary: Optional[str] = None
    conditions_imposed: Optional[str] = None
    compliance_due_date: Optional[date] = None

class PublicationCandidate(BaseModel):
    doi: Optional[str] = None
    title: str
    authors: str
    faculty_id: Optional[int] = None
    scholar_id: Optional[int] = None
    journal_name: str
    issn: Optional[str] = None
    publication_year: int
    publication_type: str = "Journal"
    is_scholar_first_or_corresponding: bool = False

class ContestationCreate(BaseModel):
    dossier_id: int
    reason: str
    evidence_url: Optional[str] = None

class HoDReviewSubmit(BaseModel):
    hod_comments: str
    agreed_next_cycle_goals: Optional[str] = None
