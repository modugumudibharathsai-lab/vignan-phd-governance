import pytest
from datetime import date
from backend.app.database import SessionLocal, Base, engine
from backend.app.seed_data import seed_database
from backend.app.models import PhDScholar, Faculty, Journal, Publication
from backend.app.agents.agent_phd_monitoring import PhDMonitoringAgent
from backend.app.agents.agent_publication_monitoring import PublicationMonitoringAgent
from backend.app.agents.agent_journal_quartile import JournalQuartileAgent
from backend.app.agents.agent_research_productivity import ResearchProductivityAgent
from backend.app.agents.agent_faculty_performance import FacultyPerformanceAgent
from backend.app.agents.agent_university_kpi import UniversityKPIAgent

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    seed_database()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_agent_25_phd_monitoring(db):
    """Test Agent 25: PhD scholar register, supervisor capacity, and publication eligibility."""
    agent = PhDMonitoringAgent(db)
    
    # 1. Verify 84 scholars loaded
    scholars_count = db.query(PhDScholar).count()
    assert scholars_count == 84, f"Expected 84 scholars, found {scholars_count}"

    # 2. Verify supervisor capacity enforcement
    capacities = agent.check_supervisor_capacities()
    assert len(capacities) > 0
    # Over-allocated or capacity-saturated supervisors should be detected
    flagged = [c for c in capacities if c["is_over_allocated"] or c["is_at_limit"] or c["utilization_pct"] >= 100]
    assert len(flagged) > 0, "Expected capacity-saturated or over-allocated supervisors to be flagged"

    # 3. Test strict dual-condition publication eligibility rule
    # Case A: Scholar with Tier-1 and >= 12 points -> SUBMISSION_ELIGIBLE
    scholar_eligible = db.query(PhDScholar).filter(PhDScholar.reg_no == "141PG04204").first()
    assert scholar_eligible is not None
    check_eligible = agent.verify_publication_eligibility(scholar_eligible.id)
    assert check_eligible["is_eligible_for_submission"] == True
    assert check_eligible["status_badge"] == "SUBMISSION_ELIGIBLE"
    assert check_eligible["dual_conditions"]["rule_1_tier1"]["satisfied"] == True
    assert check_eligible["dual_conditions"]["rule_2_cumulative_points"]["satisfied"] == True
    assert check_eligible["dual_conditions"]["rule_2_cumulative_points"]["current_points"] >= 12.0

    # Case B: Scholar with >= 12 points but MISSING Tier-1 Category 1/2 -> MISSING_TIER1
    scholar_no_tier1 = db.query(PhDScholar).filter(PhDScholar.reg_no == "171FG04005").first()
    assert scholar_no_tier1 is not None
    check_no_tier1 = agent.verify_publication_eligibility(scholar_no_tier1.id)
    assert check_no_tier1["is_eligible_for_submission"] == False
    assert check_no_tier1["status_badge"] == "MISSING_TIER1"
    assert check_no_tier1["dual_conditions"]["rule_1_tier1"]["satisfied"] == False
    assert check_no_tier1["dual_conditions"]["rule_2_cumulative_points"]["satisfied"] == True
    assert "Missing mandatory Category 1/2 Publication requirement." in check_no_tier1["status_message"]

    # Case C: Scholar with Tier-1 but < 12 points -> INSUFFICIENT_POINTS
    scholar_low_pts = db.query(PhDScholar).filter(PhDScholar.reg_no == "181PG04201").first()
    assert scholar_low_pts is not None
    check_low_pts = agent.verify_publication_eligibility(scholar_low_pts.id)
    assert check_low_pts["is_eligible_for_submission"] == False
    assert check_low_pts["status_badge"] == "INSUFFICIENT_POINTS"
    assert check_low_pts["dual_conditions"]["rule_1_tier1"]["satisfied"] == True
    assert check_low_pts["dual_conditions"]["rule_2_cumulative_points"]["satisfied"] == False
    assert check_low_pts["dual_conditions"]["rule_2_cumulative_points"]["shortfall"] > 0

    # 4. Test duration compliance & stalled scholars
    duration_res = agent.evaluate_duration_and_stalled_scholars()
    assert duration_res["total_scholars"] == 84
    assert duration_res["stalled_count"] > 0 # Cohort 2014 or overdue should be flagged

def test_agent_17_publication_monitoring(db):
    """Test Agent 17: Affiliation variance resolution, deduplication, and predatory detection."""
    agent = PublicationMonitoringAgent(db)

    # 1. Affiliation variance matching
    assert agent.check_affiliation_match("VFSTR Deemed to be University, Vadlamudi") == True
    assert agent.check_affiliation_match("Vignan University CSE Department") == True
    assert agent.check_affiliation_match("Random Unrelated University X") == False

    # 2. Deduplication check
    existing_pub = db.query(Publication).filter(Publication.doi != None).first()
    assert existing_pub is not None
    dedup = agent.deduplicate_and_attribute({
        "doi": existing_pub.doi,
        "title": existing_pub.title,
        "authors": existing_pub.authors
    })
    assert dedup["action"] == "DUPLICATE_DOI"

    # 3. Predatory detection on delisted journal
    pred = agent.detect_predatory_and_anomalies("Journal of Ambient Intelligence and Humanized Computing", "1868-5137")
    assert pred["is_flagged"] == True

def test_agent_18_journal_quartile(db):
    """Test Agent 18: ISSN resolution, quartiles, risk warnings, and alternative suggestions."""
    agent = JournalQuartileAgent(db)

    # 1. Verify premier Q1 journal
    res_q1 = agent.verify_journal("2168-2267") # IEEE Trans Cybernetics
    assert res_q1["found"] == True
    assert res_q1["quartiles"]["jcr_wos"] == "Q1"
    assert "Approved" in res_q1["verdict"]

    # 2. Verify delisted/predatory journal
    res_pred = agent.verify_journal("1868-5137") # Delisted
    assert res_pred["found"] == True
    assert "Rejected" in res_pred["verdict"]
    assert len(res_pred["alternatives"]) > 0 # Should recommend reputable alternatives
    assert res_pred["cache_validity_days_remaining"] <= 90

def test_agent_20_research_productivity(db):
    """Test Agent 20: Quality-weighted scoring, discipline normalization, and Gini concentration."""
    agent = ResearchProductivityAgent(db)
    
    fac = db.query(Faculty).first()
    assert fac is not None
    card = agent.compute_faculty_scorecard(fac.id)
    assert card["raw_publication_count"] >= 0
    assert card["discipline_normalized_score"] > 0
    assert "performance_band" in card

    # Gini concentration & department benchmarks
    benchmarks = agent.compute_department_benchmarking_and_gini()
    assert "institutional_gini_coefficient" in benchmarks
    assert len(benchmarks["department_benchmarks"]) > 0

def test_agent_59_faculty_performance(db):
    """Test Agent 59: Auto-populated appraisal dossier, administrative relief, and contestation."""
    agent = FacultyPerformanceAgent(db)

    dean = db.query(Faculty).filter(Faculty.administrative_role != "None").first()
    assert dean is not None
    dossier = agent.auto_populate_dossier(dean.id)
    assert dossier["aggregate_score"] > 0
    assert dossier["administrative_adjustment_factor"] >= 1.0

    # Contestation test
    cont = agent.submit_contestation(dossier["dossier_id"], "Discrepancy in outreach points calculation")
    assert cont["status"] == "Contested"

def test_agent_71_university_kpis(db):
    """Test Agent 71: Live KPI sync, status evaluation, and lead/lag analysis."""
    agent = UniversityKPIAgent(db)

    cockpit = agent.sync_live_indicators()
    assert len(cockpit) >= 5

    # Check that early-warning 'On_Target_Deteriorating' or 'Off_Target_Improving' is tracked
    statuses = [k["status"] for k in cockpit]
    assert any("On_Target" in s or "Off_Target" in s for s in statuses)

    correlations = agent.get_lead_lag_correlations()
    assert len(correlations) >= 3

    brief = agent.export_governance_brief()
    assert brief["total_kpis_monitored"] >= 5
    assert "nirf_score_projection" in brief

def test_phd_submission_blocked_api(db):
    """Test that complete_milestone endpoint strictly blocks PRE_SUB / SYN / THESIS if dual conditions are unmet."""
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app)

    # Scholar 2 (Deepika Nalabala, 171FG04005) has 13.5 points but lacks Tier-1 (Cat 1/2)
    scholar_no_tier1 = db.query(PhDScholar).filter(PhDScholar.reg_no == "171FG04005").first()
    assert scholar_no_tier1 is not None

    res = client.post(
        f"/api/phd/scholars/{scholar_no_tier1.id}/milestones/PRE_SUB/complete",
        json={"status": "Completed", "notes": "Candidate attempted pre-submission"}
    )
    assert res.status_code == 400
    detail = res.json()["detail"]
    assert "PhD Submission Blocked" in detail
    assert "Missing mandatory Category 1/2 Publication requirement." in detail

    # Scholar 1 (Cmak Zeelan Basha, 141PG04204) has both satisfied
    scholar_eligible = db.query(PhDScholar).filter(PhDScholar.reg_no == "141PG04204").first()
    assert scholar_eligible is not None

    res_ok = client.post(
        f"/api/phd/scholars/{scholar_eligible.id}/milestones/PRE_SUB/complete",
        json={"status": "Completed", "notes": "Approved by Doctoral Committee"}
    )
    assert res_ok.status_code == 200
    assert "marked as Completed" in res_ok.json()["message"]
