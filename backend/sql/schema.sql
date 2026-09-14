-- ==============================================================================
-- University Administration Platform - PostgreSQL Schema
-- Agents: 25 (PhD), 17 (Faculty Pubs), 18 (Journal Verifier), 
--         20 (Research Productivity), 59 (Faculty Appraisal), 71 (University KPI)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE scholar_mode AS ENUM ('Full-Time', 'Part-Time');
CREATE TYPE scholar_status AS ENUM ('Admitted', 'Coursework', 'Comprehensive_Exam', 'Proposal_Defended', 'DC_Review', 'Pre_Submission', 'Synopsis_Submitted', 'Thesis_Submitted', 'Graduated', 'Stalled', 'Exceeded_Max_Duration');
CREATE TYPE faculty_designation AS ENUM ('Professor', 'Associate Professor', 'Assistant Professor');
CREATE TYPE milestone_status AS ENUM ('Upcoming', 'In_Progress', 'Completed', 'Overdue');
CREATE TYPE dc_review_outcome AS ENUM ('Satisfactory', 'Needs_Revision', 'Unsatisfactory');
CREATE TYPE journal_quartile AS ENUM ('Q1', 'Q2', 'Q3', 'Q4', 'Unranked');
CREATE TYPE publication_type AS ENUM ('Journal', 'Conference', 'Book Chapter', 'Patent', 'Grant');
CREATE TYPE verification_verdict AS ENUM ('Approved_Tier1', 'Approved_Tier2', 'Caution_HighRisk', 'Rejected_Predatory');
CREATE TYPE appraisal_status AS ENUM ('Draft', 'Submitted', 'HoD_Reviewed', 'Dean_Approved', 'Contested', 'Finalized');
CREATE TYPE kpi_trend AS ENUM ('Improving', 'Stable', 'Deteriorating');
CREATE TYPE kpi_status AS ENUM ('On_Target_Improving', 'On_Target_Deteriorating', 'Off_Target_Improving', 'Off_Target_Deteriorating');

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    school_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Faculty Master Table
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    emp_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    designation faculty_designation NOT NULL,
    joining_date DATE NOT NULL,
    experience_years NUMERIC(4,1) DEFAULT 0.0,
    teaching_hours_per_week NUMERIC(4,1) DEFAULT 12.0,
    administrative_role VARCHAR(100) DEFAULT 'None',
    max_supervision_capacity INTEGER NOT NULL DEFAULT 8,
    current_supervision_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PhD Scholars Register (Agent 25)
CREATE TABLE IF NOT EXISTS phd_scholars (
    id SERIAL PRIMARY KEY,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    admission_year INTEGER NOT NULL,
    mode scholar_mode NOT NULL DEFAULT 'Full-Time',
    registration_date DATE NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    supervisor_id INTEGER REFERENCES faculty(id) ON DELETE RESTRICT,
    co_supervisor_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
    research_area VARCHAR(255) NOT NULL,
    current_status scholar_status NOT NULL DEFAULT 'Admitted',
    min_duration_years NUMERIC(3,1) NOT NULL,
    max_duration_years NUMERIC(3,1) NOT NULL,
    min_duration_date DATE NOT NULL,
    max_duration_date DATE NOT NULL,
    is_stalled BOOLEAN DEFAULT FALSE,
    stalled_reason TEXT,
    cumulative_research_points NUMERIC(5,1) DEFAULT 0.0,
    tier1_publication_met BOOLEAN DEFAULT FALSE,
    publication_requirement_met BOOLEAN DEFAULT FALSE,
    submission_eligibility_status VARCHAR(100) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Doctoral Committee Details (Agent 25)
CREATE TABLE IF NOT EXISTS doctoral_committees (
    id SERIAL PRIMARY KEY,
    scholar_id INTEGER UNIQUE REFERENCES phd_scholars(id) ON DELETE CASCADE,
    chairman_name VARCHAR(255) NOT NULL,
    chairman_dept VARCHAR(100),
    chairman_phone VARCHAR(50),
    chairman_email VARCHAR(255),
    hod_nominee_name VARCHAR(255),
    hod_nominee_dept VARCHAR(100),
    hod_nominee_phone VARCHAR(50),
    hod_nominee_email VARCHAR(255),
    external_expert_name VARCHAR(255) NOT NULL,
    external_expert_affiliation VARCHAR(255) NOT NULL,
    external_expert_phone VARCHAR(50),
    external_expert_email VARCHAR(255),
    internal_expert1_name VARCHAR(255) NOT NULL,
    internal_expert1_designation VARCHAR(100),
    internal_expert1_dept VARCHAR(100),
    internal_expert1_phone VARCHAR(50),
    internal_expert1_email VARCHAR(255),
    internal_expert2_name VARCHAR(255),
    internal_expert2_designation VARCHAR(100),
    internal_expert2_dept VARCHAR(100),
    internal_expert2_phone VARCHAR(50),
    internal_expert2_email VARCHAR(255),
    interschool_nominee_name VARCHAR(255),
    interschool_nominee_dept VARCHAR(100),
    interschool_nominee_phone VARCHAR(50),
    interschool_nominee_email VARCHAR(255),
    constituted_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Milestone Sequences (Agent 25)
CREATE TABLE IF NOT EXISTS phd_milestones (
    id SERIAL PRIMARY KEY,
    scholar_id INTEGER REFERENCES phd_scholars(id) ON DELETE CASCADE,
    milestone_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    sequence_order INTEGER NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    status milestone_status NOT NULL DEFAULT 'Upcoming',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_scholar_milestone UNIQUE (scholar_id, milestone_code)
);

-- 6. Doctoral Committee Reviews (Agent 25)
CREATE TABLE IF NOT EXISTS doctoral_committee_reviews (
    id SERIAL PRIMARY KEY,
    scholar_id INTEGER REFERENCES phd_scholars(id) ON DELETE CASCADE,
    review_number INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    conducted_date DATE,
    outcome dc_review_outcome NOT NULL DEFAULT 'Satisfactory',
    minutes_summary TEXT,
    conditions_imposed TEXT,
    compliance_due_date DATE,
    compliance_met BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Journal Master & Cache (Agent 18)
CREATE TABLE IF NOT EXISTS journals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    canonical_issn VARCHAR(50) UNIQUE NOT NULL,
    e_issn VARCHAR(50),
    publisher VARCHAR(255),
    wos_indexed BOOLEAN DEFAULT FALSE,
    scopus_indexed BOOLEAN DEFAULT FALSE,
    ugc_care_indexed BOOLEAN DEFAULT FALSE,
    jcr_quartile journal_quartile DEFAULT 'Unranked',
    citescore_quartile journal_quartile DEFAULT 'Unranked',
    impact_factor NUMERIC(6,3) DEFAULT 0.0,
    citescore NUMERIC(6,3) DEFAULT 0.0,
    sjr NUMERIC(6,3) DEFAULT 0.0,
    acceptance_rate NUMERIC(4,1),
    peer_review_weeks INTEGER,
    predatory_risk_score INTEGER DEFAULT 0,
    is_delisted BOOLEAN DEFAULT FALSE,
    delisted_reason TEXT,
    subject_category VARCHAR(150),
    alternative_journal_ids JSONB DEFAULT '[]'::jsonb,
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Author Identifier Master (Agent 17)
CREATE TABLE IF NOT EXISTS author_identifiers (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER UNIQUE REFERENCES faculty(id) ON DELETE CASCADE,
    scopus_author_id VARCHAR(100),
    orcid_id VARCHAR(100),
    wos_researcher_id VARCHAR(100),
    google_scholar_id VARCHAR(100),
    last_sweep_at TIMESTAMP WITH TIME ZONE
);

-- 9. Affiliation Variants Register (Agent 17)
CREATE TABLE IF NOT EXISTS affiliation_variants (
    id SERIAL PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,
    variant_string VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    added_date DATE DEFAULT CURRENT_DATE
);

-- 10. Publications Register (Agent 17 & 18)
CREATE TABLE IF NOT EXISTS publications (
    id SERIAL PRIMARY KEY,
    doi VARCHAR(150) UNIQUE,
    title VARCHAR(500) NOT NULL,
    authors TEXT NOT NULL,
    faculty_id INTEGER REFERENCES faculty(id) ON DELETE SET NULL,
    scholar_id INTEGER REFERENCES phd_scholars(id) ON DELETE SET NULL,
    journal_id INTEGER REFERENCES journals(id) ON DELETE SET NULL,
    journal_name VARCHAR(300),
    issn VARCHAR(50),
    publication_year INTEGER NOT NULL,
    publication_type publication_type NOT NULL DEFAULT 'Journal',
    is_scholar_first_or_corresponding BOOLEAN DEFAULT FALSE,
    quartile journal_quartile DEFAULT 'Unranked',
    scopus_indexed BOOLEAN DEFAULT FALSE,
    wos_indexed BOOLEAN DEFAULT FALSE,
    citations_count INTEGER DEFAULT 0,
    category_code VARCHAR(50) DEFAULT 'CAT1',
    category_name VARCHAR(255) DEFAULT 'SCI / SCI-E Indexed / ABDC Journals',
    research_points NUMERIC(3,1) DEFAULT 5.0,
    is_tier1_mandatory BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(50) DEFAULT 'Verified',
    is_flagged_predatory BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    source_origin VARCHAR(100) DEFAULT 'Scopus',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Citation & Metric Trend Series (Agent 17)
CREATE TABLE IF NOT EXISTS faculty_citation_trends (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
    record_year INTEGER NOT NULL,
    total_publications INTEGER NOT NULL,
    total_citations INTEGER NOT NULL,
    h_index INTEGER NOT NULL,
    i10_index INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_faculty_year_metric UNIQUE (faculty_id, record_year)
);

-- 12. Research Productivity Scorecards (Agent 20)
CREATE TABLE IF NOT EXISTS research_productivity_scorecards (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    raw_publication_count INTEGER DEFAULT 0,
    quality_weighted_score NUMERIC(8,2) DEFAULT 0.0,
    discipline_normalized_score NUMERIC(8,2) DEFAULT 0.0,
    phd_supervision_points NUMERIC(6,2) DEFAULT 0.0,
    patents_count INTEGER DEFAULT 0,
    funded_grants_amount NUMERIC(12,2) DEFAULT 0.0,
    consultancy_amount NUMERIC(12,2) DEFAULT 0.0,
    nirf_rpc_score NUMERIC(6,2) DEFAULT 0.0,
    performance_band VARCHAR(50) DEFAULT 'Commendable',
    support_recommendation TEXT,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_faculty_productivity_year UNIQUE (faculty_id, academic_year)
);

-- 13. Institutional Appraisal Rubric & Dossiers (Agent 59)
CREATE TABLE IF NOT EXISTS appraisal_rubrics (
    id SERIAL PRIMARY KEY,
    version_name VARCHAR(100) NOT NULL,
    effective_from_year VARCHAR(20) NOT NULL,
    teaching_weight NUMERIC(4,2) DEFAULT 0.35,
    research_weight NUMERIC(4,2) DEFAULT 0.35,
    governance_weight NUMERIC(4,2) DEFAULT 0.15,
    outreach_weight NUMERIC(4,2) DEFAULT 0.15,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS appraisal_dossiers (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES faculty(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    teaching_score NUMERIC(6,2) DEFAULT 0.0,
    teaching_hours NUMERIC(4,1) DEFAULT 12.0,
    student_feedback_avg NUMERIC(3,2) DEFAULT 4.0,
    research_score NUMERIC(6,2) DEFAULT 0.0,
    governance_score NUMERIC(6,2) DEFAULT 0.0,
    outreach_score NUMERIC(6,2) DEFAULT 0.0,
    administrative_adjustment_factor NUMERIC(4,2) DEFAULT 1.0,
    aggregate_score NUMERIC(6,2) DEFAULT 0.0,
    status appraisal_status DEFAULT 'Draft',
    hod_comments TEXT,
    dean_comments TEXT,
    agreed_next_cycle_goals TEXT,
    is_contested BOOLEAN DEFAULT FALSE,
    contestation_reason TEXT,
    contestation_evidence_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_faculty_appraisal_year UNIQUE (faculty_id, academic_year)
);

-- 14. University Key Performance Indicators (Agent 71)
CREATE TABLE IF NOT EXISTS university_kpis (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    formula TEXT NOT NULL,
    owner_role VARCHAR(100) NOT NULL,
    reporting_frequency VARCHAR(50) DEFAULT 'Quarterly',
    current_value NUMERIC(10,2) NOT NULL,
    target_value NUMERIC(10,2) NOT NULL,
    prior_period_value NUMERIC(10,2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'Units',
    trend kpi_trend NOT NULL,
    status kpi_status NOT NULL,
    nirf_framework_code VARCHAR(100),
    naac_criteria VARCHAR(100),
    lead_indicator_codes JSONB DEFAULT '[]'::jsonb,
    lag_indicator_codes JSONB DEFAULT '[]'::jsonb,
    alert_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scholars_reg_no ON phd_scholars(reg_no);
CREATE INDEX IF NOT EXISTS idx_scholars_supervisor ON phd_scholars(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_scholars_status ON phd_scholars(current_status);
CREATE INDEX IF NOT EXISTS idx_milestones_scholar ON phd_milestones(scholar_id);
CREATE INDEX IF NOT EXISTS idx_publications_faculty ON publications(faculty_id);
CREATE INDEX IF NOT EXISTS idx_publications_scholar ON publications(scholar_id);
CREATE INDEX IF NOT EXISTS idx_publications_doi ON publications(doi);
CREATE INDEX IF NOT EXISTS idx_journals_issn ON journals(canonical_issn);
CREATE INDEX IF NOT EXISTS idx_productivity_faculty ON research_productivity_scorecards(faculty_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_faculty ON appraisal_dossiers(faculty_id);
CREATE INDEX IF NOT EXISTS idx_kpis_domain ON university_kpis(domain);
CREATE INDEX IF NOT EXISTS idx_kpis_status ON university_kpis(status);
