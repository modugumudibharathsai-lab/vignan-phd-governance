# University Administration Web Platform (Multi-Agent System)

An enterprise-grade university administration platform integrating six core academic, research, and governance agents. Built with a **Python FastAPI** backend, a **PostgreSQL** schema/ORM architecture, and a **React + Tailwind CSS** role-based frontend.

Directly pre-loaded with authentic institutional data from **Vignan's Foundation for Science, Technology & Research (VFSTR / Vignan University)**, featuring 84 doctoral scholars, faculty supervisors, external experts from premier institutes (NIT Warangal, Univ of Hyderabad, NIT Andhra Pradesh, MNIT Jaipur), and complete Doctoral Committee rosters.

---

## 🏛️ Core Integrated Agents

### 1. Agent 25: PhD Monitoring Agent
* **Purpose**: Tracks every doctoral scholar through the full regulatory sequence from admission to thesis submission, ensuring no milestone, review, or eligibility condition is missed.
* **Key Workflows**:
  - Maintains complete scholar register with 84 scholars across cohorts 2014–2026.
  - Automatic regulatory duration enforcement: Full-Time (`FG`: min 3y, max 5y) vs Part-Time (`PG`: min 4y, max 7y).
  - Enforces supervisor capacity caps under university regulations (Professor: 8, Associate Prof: 6, Assistant Prof: 4) and alerts over-allocated supervisors.
  - Milestone sequence tracking: Coursework Completion, Comprehensive Examination, Research Proposal Defence, 6-Month Doctoral Committee Reviews (DC1–DC8), Publication Requirement Fulfilment, Pre-Submission Seminar, Synopsis Submission, and Thesis Submission.
  - Verifies publication eligibility conditions against verified records from Agent 17 (requiring at least 2 Scopus/WoS indexed Q1/Q2 journal papers with scholar as first or corresponding author).
  - Flags stalled cases and scholars exceeding regulatory duration limits.

### 2. Agent 17: Faculty Research Publication Monitoring Agent
* **Purpose**: Eliminates annual email reconciliation by maintaining verified, continuously updated records of faculty publications, citations, and external author identifiers.
* **Key Workflows**:
  - Author identity registry linking faculty to Scopus Author ID, ORCID, and Web of Science ResearcherID.
  - Institutional affiliation variant resolver handling spellings such as `VFSTR`, `Vignan University`, `VFSTR Deemed to be University, Vadlamudi`.
  - Automated ingestion sweep and cross-source deduplication (exact DOI match first, followed by fuzzy title/author similarity).
  - Detection of predatory or delisted journals and unusually rapid publication velocities (>3 papers in a month).
  - Time-series tracking of total publications, citations, and h-index.
  - One-click accreditation evidence export for NAAC & NIRF submissions.

### 3. Agent 18: Journal Quartile Verification Agent
* **Purpose**: Verifies indexing status and quality tier of any journal or conference before faculty or scholars submit manuscripts, preventing publication in predatory or delisted venues.
* **Key Workflows**:
  - Resolves any ISSN, eISSN, or title to canonical journal records.
  - Multi-source indexing verification: Web of Science (WoS), Scopus, and UGC-CARE.
  - Quartile retrieval from JCR (WoS) and CiteScore (Scopus) across subject categories.
  - Predatory and questionable publisher risk index screening (0 to 100).
  - Actionable verdicts (`Approved - Tier 1`, `Approved - Tier 2`, `Caution`, `Rejected - Predatory / Delisted`).
  - Recommends reputable alternative Q1/Q2 peer venues in the same subject area.
  - Cache validity window guardrail (90-day validity window with stale alerts).

### 4. Agent 20: Research Productivity Agent
* **Purpose**: Converts research outputs into quality-weighted, discipline-normalized longitudinal productivity scorecards and institutional concentration analyses.
* **Key Workflows**:
  - Quality-weighted scoring across quartiles (Q1: 15 pts, Q2: 10 pts, Q3: 5 pts, Q4: 2 pts) and PhD supervisions from Agent 25.
  - Discipline normalization: normalizes scores across STEM (CSE/IT), Engineering (ECE/Mech), Biotechnology, and Sciences & Humanities (S&H/Mathematics), adjusting for experience, teaching hours, and administrative leadership.
  - Departmental benchmarking and institutional Gini concentration coefficient (measuring whether research output is widely distributed or concentrated in a few individuals).
  - High-performer recognition roster and non-punitive developmental support queue.
  - NIRF Research and Professional Practice (RPC) indicator calculation.

### 5. Agent 59: Faculty Performance Agent
* **Purpose**: Consolidates faculty contributions across teaching, research, and governance into a pre-populated annual appraisal dossier, replacing tedious self-declarations.
* **Key Workflows**:
  - Encoded institutional rubric: Teaching (35%), Research (35%), Administration (15%), and Outreach (15%).
  - Auto-population: automatically draws verified publications from Agent 17, PhD scholars guided from Agent 25, and classroom teaching loads.
  - Administrative relief multiplier: applies adjustment factors (e.g. 1.2x) for heavy administrative roles (Dean, HoD) to avoid penalizing institutional leadership.
  - Structured review briefs for the Head of Department.
  - Formal contestability workflow allowing faculty to contest automated scores with documentary evidence and IQAC review.

### 6. Agent 71: University Key Performance Indicator (KPI) Agent
* **Purpose**: Live institutional performance framework providing university executive leadership with continuous institutional health monitoring rather than once-a-year retrospective compilation.
* **Key Workflows**:
  - Framework covering 6 core domains: Research & Innovation, Doctoral Studies, Governance & Compliance, Faculty Quality, Academic & Teaching, and Accreditation Readiness.
  - Multi-status classification: *On Target & Improving*, *Off Target but Improving*, *Off Target & Deteriorating*, and the critical early warning: **On Target but Deteriorating** (Amber Alert).
  - Lead/Lag predictive correlation analysis (e.g. Doctoral review delays causing downstream drops in thesis completions; Faculty grant mentoring producing Q1 publications 2 years later).
  - Direct crosswalk to NIRF Ranking and NAAC Criteria III metrics.
  - One-click Governance Briefing Report export for the Vice Chancellor and Governing Body.

---

## 👥 Role-Based Personas (Switchable in Top Navigation)

| Persona Role | Named Individual | Department | Access & Primary View |
| :--- | :--- | :--- | :--- |
| **Vice Chancellor & IQAC Director** | Dr. P. Nagabhushan | Executive Leadership | Full Agent 71 KPI Cockpit, NIRF/NAAC Forecasts, Gini concentration index |
| **Dean of Research** | Dr. S. V. Phani Kumar | Research Deanery | Agent 25 PhD monitoring, supervisor capacity caps, Agent 17 sweeps |
| **Head of Department (HoD)** | Dr. K. V. Krishna Kishore | CSE | Departmental PhD scholar reviews, DC committee minutes, Agent 59 HoD briefs |
| **Doctoral Supervisor & Faculty** | Dr. M. Nirupama Bhat | CSE | Guided scholar list, Agent 18 Journal pre-check, Agent 59 self-appraisal dossier |
| **Doctoral Scholar** | Uttej Kumar Nannapaneni | CSE (Reg: `221FG04001`) | Personal PhD timeline, countdown to max duration, Agent 17 publication audit |

---

## 🚀 Quick Start & Local Execution in Google Chrome

### Option 1: Double-Click Launcher (Windows)
Double-click `run_platform.bat` in the project root. It will:
1. Initialize the SQLite / PostgreSQL database.
2. Ingest the 84 doctoral scholars and faculty supervisors.
3. Start the FastAPI backend on `http://127.0.0.1:8000`.
4. Automatically open **Google Chrome** to the platform dashboard!

### Option 2: Command Line
```powershell
# In the uni-platform directory:
python launch.py
```

The terminal will confirm:
```
======================================================================
  VFSTR Vignan University Multi-Agent Administration Platform
  Agents Active: 25, 17, 18, 20, 59, 71
======================================================================
  Local Server: http://127.0.0.1:8000
  Opening platform in Google Chrome...
======================================================================
```

---

## 🗄️ Database Architecture & PostgreSQL Setup

### Default Local Zero-Dependency Mode
The platform runs immediately out-of-the-box using SQLite (`sqlite:///./uni_platform.db`) without requiring an active PostgreSQL service.

### Production PostgreSQL Mode
To connect to a live PostgreSQL server:
1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE university_db;
   ```
2. Apply the production DDL schema:
   ```bash
   psql -U postgres -d university_db -f backend/sql/schema.sql
   ```
3. Set the environment variable:
   ```powershell
   $env:DATABASE_URL = "postgresql+psycopg2://postgres:password@localhost:5432/university_db"
   python launch.py
   ```

---

## 🧪 Automated Testing Suite

To run the automated agent test suite:
```powershell
$env:PYTHONPATH = "."
python -m pytest backend/tests/test_agents.py -v
```

All 6 test suites validate:
- `test_agent_25_phd_monitoring`: 84 scholars, supervisor capacity limit enforcement, duration tracking, publication eligibility.
- `test_agent_17_publication_monitoring`: Affiliation variance matching, DOI deduplication, predatory detection, ingestion sweeps.
- `test_agent_18_journal_quartile`: ISSN resolution, Q1/Q2 quartiles, predatory flags, alternative suggestions, 90-day cache guardrail.
- `test_agent_20_research_productivity`: Quality-weighted scorecards, discipline normalization factors, Gini concentration index.
- `test_agent_59_faculty_performance`: Auto-populated dossiers, administrative relief factor, contestation audit trail.
- `test_agent_71_university_kpis`: Live KPI sync, status evaluation, early-warning Amber alerts, lead/lag correlation analysis.

---

## 🌐 API Endpoints Reference

### Agent 25: PhD Monitoring
- `GET /api/phd/scholars`: List scholars with filters (area, year, supervisor, status, mode).
- `GET /api/phd/scholars/{id}`: Detailed dossier with milestones, committee, and publications.
- `GET /api/phd/supervisor-capacities`: Capacity limits, utilization %, and over-allocation alerts.
- `GET /api/phd/scholars/{id}/publication-eligibility`: Verification against degree submission criteria.
- `GET /api/phd/duration-compliance`: Stalled scholar list and duration boundary countdowns.
- `POST /api/phd/scholars/{id}/milestones/{code}/complete`: Complete a regulatory milestone.

### Agent 17: Faculty Publications
- `GET /api/publications/`: List verified publications.
- `POST /api/publications/ingest`: Ingest publication with deduplication and predatory screening.
- `POST /api/publications/sweep`: Trigger external indexing sweep.
- `GET /api/publications/accreditation-export`: Export NAAC/NIRF publication evidence.
- `GET /api/publications/flagged-queue`: Ambiguous or predatory flagged records.

### Agent 18: Journal Quartile Verifier
- `GET /api/journals/verify?query={ISSN_or_Title}`: Full venue verification, quartile, risk score, and alternatives.
- `GET /api/journals/approved-list`: Institutional approved venues roster.

### Agent 20: Research Productivity
- `GET /api/productivity/scorecards`: All faculty productivity scorecards.
- `GET /api/productivity/department-benchmarks`: Departmental totals and Gini concentration index.
- `GET /api/productivity/recognition-and-support`: High-performer recognition and developmental support queues.

### Agent 59: Faculty Performance
- `GET /api/performance/dossier/{faculty_id}`: Auto-populated appraisal dossier.
- `GET /api/performance/hod-brief/{faculty_id}`: Structured brief for HoD review interview.
- `POST /api/performance/contestation`: Submit formal contestation with audit trail.

### Agent 71: University KPIs
- `GET /api/kpis/cockpit`: Live institutional strategic KPI register.
- `POST /api/kpis/sync`: Live synchronization across producing agents.
- `GET /api/kpis/lead-lag-correlations`: Lead/lag predictive relationship models.
- `GET /api/kpis/governance-brief`: Executive governance summary report.
