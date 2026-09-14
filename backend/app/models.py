from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, Date, DateTime, 
    ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    school_name = Column(String(150), default="School of Computing & Informatics")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    faculty_members = relationship("Faculty", back_populates="department")
    scholars = relationship("PhDScholar", back_populates="department")


class Faculty(Base):
    __tablename__ = "faculty"
    
    id = Column(Integer, primary_key=True, index=True)
    emp_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    designation = Column(String(100), nullable=False) # Professor, Associate Professor, Assistant Professor
    joining_date = Column(Date, default=date(2015, 1, 1))
    experience_years = Column(Float, default=10.0)
    teaching_hours_per_week = Column(Float, default=12.0)
    administrative_role = Column(String(100), default="None")
    max_supervision_capacity = Column(Integer, default=8)
    current_supervision_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    department = relationship("Department", back_populates="faculty_members")
    scholars = relationship("PhDScholar", foreign_keys="[PhDScholar.supervisor_id]", back_populates="supervisor")
    publications = relationship("Publication", back_populates="faculty")
    identifiers = relationship("AuthorIdentifier", back_populates="faculty", uselist=False)
    citation_trends = relationship("FacultyCitationTrend", back_populates="faculty")
    productivity_scorecards = relationship("ResearchProductivityScorecard", back_populates="faculty")
    appraisal_dossiers = relationship("AppraisalDossier", back_populates="faculty")


class PhDScholar(Base):
    __tablename__ = "phd_scholars"
    
    id = Column(Integer, primary_key=True, index=True)
    reg_no = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50))
    admission_year = Column(Integer, nullable=False)
    mode = Column(String(50), default="Full-Time") # Full-Time (FG) or Part-Time (PG)
    registration_date = Column(Date, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))
    supervisor_id = Column(Integer, ForeignKey("faculty.id"))
    co_supervisor_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    research_area = Column(String(255), nullable=False)
    current_status = Column(String(100), default="Coursework")
    min_duration_years = Column(Float, default=3.0)
    max_duration_years = Column(Float, default=5.0)
    min_duration_date = Column(Date, nullable=False)
    max_duration_date = Column(Date, nullable=False)
    is_stalled = Column(Boolean, default=False)
    stalled_reason = Column(Text, nullable=True)
    cumulative_research_points = Column(Float, default=0.0)
    tier1_publication_met = Column(Boolean, default=False)
    publication_requirement_met = Column(Boolean, default=False)
    submission_eligibility_status = Column(String(100), default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    department = relationship("Department", back_populates="scholars")
    supervisor = relationship("Faculty", foreign_keys=[supervisor_id], back_populates="scholars")
    co_supervisor = relationship("Faculty", foreign_keys=[co_supervisor_id])
    milestones = relationship("PhDMilestone", back_populates="scholar", cascade="all, delete-orphan")
    dc_committee = relationship("DoctoralCommittee", back_populates="scholar", uselist=False, cascade="all, delete-orphan")
    dc_reviews = relationship("DoctoralCommitteeReview", back_populates="scholar", cascade="all, delete-orphan")
    publications = relationship("Publication", back_populates="scholar")


class DoctoralCommittee(Base):
    __tablename__ = "doctoral_committees"
    
    id = Column(Integer, primary_key=True, index=True)
    scholar_id = Column(Integer, ForeignKey("phd_scholars.id"), unique=True, nullable=False)
    
    chairman_name = Column(String(255), nullable=True)
    chairman_dept = Column(String(100), nullable=True)
    chairman_phone = Column(String(50), nullable=True)
    chairman_email = Column(String(255), nullable=True)
    
    hod_nominee_name = Column(String(255), nullable=True)
    hod_nominee_dept = Column(String(100), nullable=True)
    hod_nominee_phone = Column(String(50), nullable=True)
    hod_nominee_email = Column(String(255), nullable=True)
    
    external_expert_name = Column(String(255), nullable=True)
    external_expert_affiliation = Column(String(255), nullable=True) # e.g. NITW, UoHyd, NIT-AP, MNIT
    external_expert_phone = Column(String(50), nullable=True)
    external_expert_email = Column(String(255), nullable=True)
    
    internal_expert1_name = Column(String(255), nullable=True)
    internal_expert1_designation = Column(String(100), nullable=True)
    internal_expert1_dept = Column(String(100), nullable=True)
    internal_expert1_phone = Column(String(50), nullable=True)
    internal_expert1_email = Column(String(255), nullable=True)
    
    internal_expert2_name = Column(String(255), nullable=True)
    internal_expert2_designation = Column(String(100), nullable=True)
    internal_expert2_dept = Column(String(100), nullable=True)
    internal_expert2_phone = Column(String(50), nullable=True)
    internal_expert2_email = Column(String(255), nullable=True)
    
    interschool_nominee_name = Column(String(255), nullable=True)
    interschool_nominee_dept = Column(String(100), nullable=True) # ECE, Mech, BT, S&H, Mathematics
    interschool_nominee_phone = Column(String(50), nullable=True)
    interschool_nominee_email = Column(String(255), nullable=True)
    
    constituted_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scholar = relationship("PhDScholar", back_populates="dc_committee")


class PhDMilestone(Base):
    __tablename__ = "phd_milestones"
    
    id = Column(Integer, primary_key=True, index=True)
    scholar_id = Column(Integer, ForeignKey("phd_scholars.id"), nullable=False)
    milestone_code = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    sequence_order = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    completion_date = Column(Date, nullable=True)
    status = Column(String(50), default="Upcoming") # Completed, In Progress, Upcoming, Overdue
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scholar = relationship("PhDScholar", back_populates="milestones")


class DoctoralCommitteeReview(Base):
    __tablename__ = "doctoral_committee_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    scholar_id = Column(Integer, ForeignKey("phd_scholars.id"), nullable=False)
    review_number = Column(Integer, nullable=False) # 1 to 10 (semi-annual)
    scheduled_date = Column(Date, nullable=False)
    conducted_date = Column(Date, nullable=True)
    outcome = Column(String(50), default="Satisfactory") # Satisfactory, Needs Revision, Unsatisfactory
    minutes_summary = Column(Text, nullable=True)
    conditions_imposed = Column(Text, nullable=True)
    compliance_due_date = Column(Date, nullable=True)
    compliance_met = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scholar = relationship("PhDScholar", back_populates="dc_reviews")


class Journal(Base):
    __tablename__ = "journals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    canonical_issn = Column(String(50), unique=True, nullable=False, index=True)
    e_issn = Column(String(50), nullable=True)
    publisher = Column(String(255), nullable=True)
    wos_indexed = Column(Boolean, default=True)
    scopus_indexed = Column(Boolean, default=True)
    ugc_care_indexed = Column(Boolean, default=True)
    jcr_quartile = Column(String(20), default="Q1") # Q1, Q2, Q3, Q4, Unranked
    citescore_quartile = Column(String(20), default="Q1")
    impact_factor = Column(Float, default=4.5)
    citescore = Column(Float, default=5.2)
    sjr = Column(Float, default=1.2)
    acceptance_rate = Column(Float, default=18.0)
    peer_review_weeks = Column(Integer, default=10)
    predatory_risk_score = Column(Integer, default=0) # 0 to 100
    is_delisted = Column(Boolean, default=False)
    delisted_reason = Column(Text, nullable=True)
    subject_category = Column(String(150), default="Computer Science & AI")
    alternative_journal_ids = Column(JSON, default=list)
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    
    publications = relationship("Publication", back_populates="journal")


class AuthorIdentifier(Base):
    __tablename__ = "author_identifiers"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), unique=True, nullable=False)
    scopus_author_id = Column(String(100), nullable=True)
    orcid_id = Column(String(100), nullable=True)
    wos_researcher_id = Column(String(100), nullable=True)
    google_scholar_id = Column(String(100), nullable=True)
    last_sweep_at = Column(DateTime, default=datetime.utcnow)
    
    faculty = relationship("Faculty", back_populates="identifiers")


class AffiliationVariant(Base):
    __tablename__ = "affiliation_variants"
    
    id = Column(Integer, primary_key=True, index=True)
    canonical_name = Column(String(255), nullable=False)
    variant_string = Column(String(255), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    added_date = Column(Date, default=date.today)


class Publication(Base):
    __tablename__ = "publications"
    
    id = Column(Integer, primary_key=True, index=True)
    doi = Column(String(150), unique=True, nullable=True, index=True)
    title = Column(String(500), nullable=False)
    authors = Column(Text, nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    scholar_id = Column(Integer, ForeignKey("phd_scholars.id"), nullable=True)
    journal_id = Column(Integer, ForeignKey("journals.id"), nullable=True)
    journal_name = Column(String(300), nullable=True)
    issn = Column(String(50), nullable=True)
    publication_year = Column(Integer, nullable=False)
    publication_type = Column(String(50), default="Journal")
    is_scholar_first_or_corresponding = Column(Boolean, default=False)
    quartile = Column(String(20), default="Q1")
    scopus_indexed = Column(Boolean, default=True)
    wos_indexed = Column(Boolean, default=True)
    citations_count = Column(Integer, default=0)
    category_code = Column(String(50), default="CAT1") # CAT1, CAT2, CAT3, CAT4, CAT5_PUB, CAT5_GRANT, CAT6, CAT7, CAT8, CAT9
    category_name = Column(String(255), default="SCI / SCI-E Indexed / ABDC Journals")
    research_points = Column(Float, default=5.0)
    is_tier1_mandatory = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    verification_status = Column(String(50), default="Verified") # Verified, Ambiguous, Flagged, Under_Review
    is_flagged_predatory = Column(Boolean, default=False)
    flagged_reason = Column(Text, nullable=True)
    source_origin = Column(String(100), default="Scopus")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    faculty = relationship("Faculty", back_populates="publications")
    scholar = relationship("PhDScholar", back_populates="publications")
    journal = relationship("Journal", back_populates="publications")


class FacultyCitationTrend(Base):
    __tablename__ = "faculty_citation_trends"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    record_year = Column(Integer, nullable=False)
    total_publications = Column(Integer, default=0)
    total_citations = Column(Integer, default=0)
    h_index = Column(Integer, default=0)
    i10_index = Column(Integer, default=0)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    faculty = relationship("Faculty", back_populates="citation_trends")


class ResearchProductivityScorecard(Base):
    __tablename__ = "research_productivity_scorecards"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    academic_year = Column(String(20), nullable=False)
    raw_publication_count = Column(Integer, default=0)
    quality_weighted_score = Column(Float, default=0.0)
    discipline_normalized_score = Column(Float, default=0.0)
    phd_supervision_points = Column(Float, default=0.0)
    patents_count = Column(Integer, default=0)
    funded_grants_amount = Column(Float, default=0.0)
    consultancy_amount = Column(Float, default=0.0)
    nirf_rpc_score = Column(Float, default=0.0)
    performance_band = Column(String(50), default="Commendable")
    support_recommendation = Column(Text, nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow)
    
    faculty = relationship("Faculty", back_populates="productivity_scorecards")


class AppraisalRubric(Base):
    __tablename__ = "appraisal_rubrics"
    
    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String(100), nullable=False)
    effective_from_year = Column(String(20), nullable=False)
    teaching_weight = Column(Float, default=0.35)
    research_weight = Column(Float, default=0.35)
    governance_weight = Column(Float, default=0.15)
    outreach_weight = Column(Float, default=0.15)
    is_active = Column(Boolean, default=True)


class AppraisalDossier(Base):
    __tablename__ = "appraisal_dossiers"
    
    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    academic_year = Column(String(20), nullable=False)
    teaching_score = Column(Float, default=0.0)
    teaching_hours = Column(Float, default=12.0)
    student_feedback_avg = Column(Float, default=4.2)
    research_score = Column(Float, default=0.0)
    governance_score = Column(Float, default=0.0)
    outreach_score = Column(Float, default=0.0)
    administrative_adjustment_factor = Column(Float, default=1.0)
    aggregate_score = Column(Float, default=0.0)
    status = Column(String(50), default="Draft") # Draft, Submitted, HoD_Reviewed, Dean_Approved, Contested, Finalized
    hod_comments = Column(Text, nullable=True)
    dean_comments = Column(Text, nullable=True)
    agreed_next_cycle_goals = Column(Text, nullable=True)
    is_contested = Column(Boolean, default=False)
    contestation_reason = Column(Text, nullable=True)
    contestation_evidence_url = Column(Text, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    faculty = relationship("Faculty", back_populates="appraisal_dossiers")


class UniversityKPI(Base):
    __tablename__ = "university_kpis"
    
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(100), nullable=False) # Research, Doctoral, Faculty, Academic, Governance, Accreditation
    code = Column(String(50), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    formula = Column(Text, nullable=False)
    owner_role = Column(String(100), nullable=False)
    reporting_frequency = Column(String(50), default="Quarterly")
    current_value = Column(Float, nullable=False)
    target_value = Column(Float, nullable=False)
    prior_period_value = Column(Float, nullable=False)
    unit = Column(String(30), default="Units")
    trend = Column(String(50), nullable=False) # Improving, Stable, Deteriorating
    status = Column(String(50), nullable=False) # On_Target_Improving, On_Target_Deteriorating, Off_Target_Improving, Off_Target_Deteriorating
    nirf_framework_code = Column(String(100), nullable=True)
    naac_criteria = Column(String(100), nullable=True)
    lead_indicator_codes = Column(JSON, default=list)
    lag_indicator_codes = Column(JSON, default=list)
    alert_message = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
