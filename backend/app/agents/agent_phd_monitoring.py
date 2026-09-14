from datetime import date, datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models import (
    PhDScholar, Faculty, PhDMilestone, DoctoralCommittee, 
    DoctoralCommitteeReview, Publication
)

class PhDMonitoringAgent:
    """
    Agent 25: PhD Monitoring Agent
    Tracks doctoral scholars through the full regulatory sequence from admission
    to thesis submission, enforcing supervisor capacity limits, duration limits,
    doctoral committee reviews, and publication eligibility via Agent 17.
    """

    CAPACITY_LIMITS = {
        "Professor": 8,
        "Associate Professor": 6,
        "Assistant Professor": 4
    }

    MILESTONE_DEFINITIONS = [
        {"code": "CW", "name": "Coursework Completion", "order": 1, "offset_months_ft": 12, "offset_months_pt": 18},
        {"code": "CE", "name": "Comprehensive / Qualifying Examination", "order": 2, "offset_months_ft": 18, "offset_months_pt": 24},
        {"code": "RPD", "name": "Research Proposal Defence", "order": 3, "offset_months_ft": 24, "offset_months_pt": 30},
        {"code": "DC1", "name": "1st Doctoral Committee Review", "order": 4, "offset_months_ft": 6, "offset_months_pt": 6},
        {"code": "DC2", "name": "2nd Doctoral Committee Review", "order": 5, "offset_months_ft": 12, "offset_months_pt": 12},
        {"code": "DC3", "name": "3rd Doctoral Committee Review", "order": 6, "offset_months_ft": 18, "offset_months_pt": 18},
        {"code": "DC4", "name": "4th Doctoral Committee Review", "order": 7, "offset_months_ft": 24, "offset_months_pt": 24},
        {"code": "DC5", "name": "5th Doctoral Committee Review", "order": 8, "offset_months_ft": 30, "offset_months_pt": 30},
        {"code": "DC6", "name": "6th Doctoral Committee Review", "order": 9, "offset_months_ft": 36, "offset_months_pt": 36},
        {"code": "PUB_REQ", "name": "Publication Requirement Fulfilment (Agent 17)", "order": 10, "offset_months_ft": 36, "offset_months_pt": 48},
        {"code": "PRE_SUB", "name": "Pre-Submission Seminar", "order": 11, "offset_months_ft": 38, "offset_months_pt": 50},
        {"code": "SYN", "name": "Synopsis Submission", "order": 12, "offset_months_ft": 40, "offset_months_pt": 54},
        {"code": "THESIS", "name": "Thesis Submission & Final Defence", "order": 13, "offset_months_ft": 42, "offset_months_pt": 60}
    ]

    def __init__(self, db: Session):
        self.db = db

    def check_supervisor_capacities(self) -> List[Dict[str, Any]]:
        """
        Enforces supervisor capacity limits under university regulations:
        Prof: 8, Assoc Prof: 6, Asst Prof: 4. Flags over-allocation.
        """
        supervisors = self.db.query(Faculty).all()
        report = []
        for sup in supervisors:
            # Count active scholars where status not Graduated
            active_scholars = self.db.query(PhDScholar).filter(
                PhDScholar.supervisor_id == sup.id,
                PhDScholar.current_status != "Graduated"
            ).count()

            # Normalise designation correctly
            d = sup.designation.lower()
            if "asst" in d or "assistant" in d:
                desig_clean = "Assistant Professor"
            elif "assoc" in d or "associate" in d:
                desig_clean = "Associate Professor"
            else:
                desig_clean = "Professor"
            
            allowed = self.CAPACITY_LIMITS.get(desig_clean, 6)
            is_over = active_scholars > allowed
            is_at_limit = active_scholars == allowed
            excess = max(0, active_scholars - allowed)

            sup.current_supervision_count = active_scholars
            sup.max_supervision_capacity = allowed

            severity = "CRITICAL" if excess >= 2 else ("WARNING" if is_over else ("AT_LIMIT" if is_at_limit else "NORMAL"))

            report.append({
                "faculty_id": sup.id,
                "name": sup.name,
                "designation": desig_clean,
                "department": sup.department.name if sup.department else "CSE",
                "email": sup.email,
                "phone": sup.phone,
                "current_count": active_scholars,
                "allowed_capacity": allowed,
                "utilization_pct": round((active_scholars / allowed) * 100, 1) if allowed > 0 else 100,
                "is_over_allocated": is_over,
                "is_at_limit": is_at_limit,
                "excess_count": excess,
                "flag_severity": severity
            })

        self.db.commit()
        return sorted(report, key=lambda x: (x["is_over_allocated"], x["utilization_pct"]), reverse=True)

    # Official Institutional Research Points Scoring Matrix
    RESEARCH_POINTS_MATRIX = {
        "CAT1": {
            "category_no": 1,
            "name": "SCI / SCI-E Indexed / ABDC Journals",
            "points": 5.0,
            "is_tier1_mandatory": True,
            "description": "Category 1: SCI / SCI-E Indexed or ABDC Journal Publication (MANDATORY: At least 1 required if no Category 2)"
        },
        "CAT2": {
            "category_no": 2,
            "name": "Top-Notch Conferences (First Level, SRB Approved)",
            "points": 4.5,
            "is_tier1_mandatory": True,
            "description": "Category 2: Top-Notch First Level Conference approved by SRB (MANDATORY: At least 1 required if no Category 1)"
        },
        "CAT3": {
            "category_no": 3,
            "name": "Top-Notch Conferences (Second Level, SRB Approved)",
            "points": 4.0,
            "is_tier1_mandatory": False,
            "description": "Category 3: Top-Notch Second Level Conference approved by SRB"
        },
        "CAT4": {
            "category_no": 4,
            "name": "SCOPUS / E-SCI Indexed Journal",
            "points": 4.0,
            "is_tier1_mandatory": False,
            "description": "Category 4: Scopus or Emerging Sources Citation Index (E-SCI) Journal"
        },
        "CAT5_PUB": {
            "category_no": 5,
            "name": "Patents Published",
            "points": 2.0,
            "is_tier1_mandatory": False,
            "description": "Category 5a: Official Patent Published"
        },
        "CAT5_GRANT": {
            "category_no": 5,
            "name": "Patents Granted (DC Approved)",
            "points": 3.5,
            "is_tier1_mandatory": False,
            "description": "Category 5b: Patent Granted (To be decided by the DC)"
        },
        "CAT6": {
            "category_no": 6,
            "name": "Refereed Int. Conference with Full Proceedings (High-Class Publisher)",
            "points": 3.0,
            "is_tier1_mandatory": False,
            "description": "Category 6: Refereed International Conference with full proceedings published by high-class publisher"
        },
        "CAT7": {
            "category_no": 7,
            "name": "Other Refereed Journals of Repute (DC Approved)",
            "points": 2.5,
            "is_tier1_mandatory": False,
            "description": "Category 7: Other refereed Journals of Repute (To be decided by the DC)"
        },
        "CAT8": {
            "category_no": 8,
            "name": "Refereed International Conferences (DC Approved)",
            "points": 2.0,
            "is_tier1_mandatory": False,
            "description": "Category 8: Refereed International Conferences (To be decided by the DC)"
        },
        "CAT9": {
            "category_no": 9,
            "name": "Refereed National Conferences (DC Approved)",
            "points": 1.5,
            "is_tier1_mandatory": False,
            "description": "Category 9: Refereed National Conferences (To be decided by the DC)"
        }
    }

    def verify_publication_eligibility(self, scholar_id: int) -> Dict[str, Any]:
        """
        Enforces the strict dual-condition rule for PhD synopsis/thesis submission:
        1. Mandatory Tier-1 Publication Rule:
           At least ONE publication from Category 1 (SCI/SCI-E/ABDC) or Category 2 (Top-Notch Conf Level 1).
        2. Cumulative Points Rule:
           At least 12.0 cumulative research points across all categories.
        """
        scholar = self.db.query(PhDScholar).filter(PhDScholar.id == scholar_id).first()
        if not scholar:
            return {"error": f"Scholar {scholar_id} not found"}

        pubs = self.db.query(Publication).filter(
            Publication.scholar_id == scholar.id,
            Publication.is_verified == True,
            Publication.is_flagged_predatory == False
        ).all()

        scored_outputs = []
        tier1_outputs = []
        cumulative_points = 0.0

        for p in pubs:
            cat_code = p.category_code or ("CAT1" if p.wos_indexed or p.quartile in ["Q1", "Q2"] else "CAT4")
            cat_info = self.RESEARCH_POINTS_MATRIX.get(cat_code, self.RESEARCH_POINTS_MATRIX["CAT4"])
            pts = p.research_points if (p.research_points and p.research_points > 0) else cat_info["points"]
            is_tier1 = cat_info["is_tier1_mandatory"] or cat_code in ["CAT1", "CAT2"]

            output_entry = {
                "id": p.id,
                "title": p.title,
                "venue": p.journal_name,
                "category_code": cat_code,
                "category_no": cat_info["category_no"],
                "category_name": cat_info["name"],
                "research_points": pts,
                "is_tier1": is_tier1,
                "publication_year": p.publication_year,
                "doi": p.doi,
                "issn": p.issn,
                "citations": p.citations_count
            }
            scored_outputs.append(output_entry)
            cumulative_points += pts

            if is_tier1:
                tier1_outputs.append(output_entry)

        cumulative_points = round(cumulative_points, 1)
        required_points = 12.0
        tier1_met = len(tier1_outputs) >= 1
        points_met = cumulative_points >= required_points
        is_eligible = tier1_met and points_met

        # Determine Distinct Status and Warning Messages
        if points_met and not tier1_met:
            status_badge = "MISSING_TIER1"
            status_color = "amber"
            status_message = (
                f"Missing mandatory Category 1/2 Publication requirement. "
                f"Candidate has accumulated {cumulative_points} / 12.0 research points, but lacks at least ONE "
                f"mandatory publication from Category 1 (SCI / SCI-E Indexed / ABDC Journals) or "
                f"Category 2 (Top-Notch Conferences - First Level, approved by SRB). Submission locked."
            )
        elif tier1_met and not points_met:
            shortfall = round(required_points - cumulative_points, 1)
            status_badge = "INSUFFICIENT_POINTS"
            status_color = "amber"
            status_message = (
                f"Mandatory Tier-1 requirement satisfied ({len(tier1_outputs)} paper in Cat 1/2), but points shortfall: "
                f"{cumulative_points} / 12.0 research points accumulated (Needs {shortfall} more points to reach 12.0 threshold)."
            )
        elif not tier1_met and not points_met:
            shortfall = round(required_points - cumulative_points, 1)
            status_badge = "NOT_ELIGIBLE"
            status_color = "rose"
            status_message = (
                f"Missing mandatory Category 1/2 publication requirement and requires {shortfall} more "
                f"research points (Current: {cumulative_points} / 12.0). Submission locked."
            )
        else:
            status_badge = "SUBMISSION_ELIGIBLE"
            status_color = "emerald"
            status_message = (
                f"Eligible for PhD Synopsis & Thesis Submission! Dual conditions satisfied: "
                f"Mandatory Tier-1 publication requirement met ({len(tier1_outputs)} paper(s)) and "
                f"{cumulative_points} / 12.0 cumulative research points acquired."
            )

        # Update scholar entity
        scholar.cumulative_research_points = cumulative_points
        scholar.tier1_publication_met = tier1_met
        scholar.publication_requirement_met = is_eligible
        scholar.submission_eligibility_status = status_badge
        self.db.commit()

        # Build category distribution summary
        category_summary = {}
        for out in scored_outputs:
            c_name = out["category_name"]
            category_summary[c_name] = category_summary.get(c_name, 0.0) + out["research_points"]

        return {
            "scholar_id": scholar.id,
            "reg_no": scholar.reg_no,
            "name": scholar.name,
            "is_eligible_for_submission": is_eligible,
            "status_badge": status_badge,
            "status_color": status_color,
            "status_message": status_message,
            "dual_conditions": {
                "rule_1_tier1": {
                    "rule_title": "Mandatory Category 1 / Category 2 Publication Rule",
                    "satisfied": tier1_met,
                    "tier1_count": len(tier1_outputs),
                    "required_min": 1,
                    "qualifying_papers": tier1_outputs,
                    "allowed_categories": [
                        "Category 1: SCI / SCI-E Indexed / ABDC Journals (5.0 pts)",
                        "Category 2: Top-Notch Conferences - First Level, approved by SRB (4.5 pts)"
                    ]
                },
                "rule_2_cumulative_points": {
                    "rule_title": "Minimum 12 Cumulative Research Points Rule",
                    "satisfied": points_met,
                    "current_points": cumulative_points,
                    "required_points": required_points,
                    "percentage": min(100.0, round((cumulative_points / required_points) * 100, 1)),
                    "shortfall": max(0.0, round(required_points - cumulative_points, 1)),
                    "surplus": max(0.0, round(cumulative_points - required_points, 1))
                }
            },
            "research_outputs": scored_outputs,
            "category_point_distribution": category_summary,
            "scoring_matrix_reference": self.RESEARCH_POINTS_MATRIX
        }

    def evaluate_duration_and_stalled_scholars(self) -> Dict[str, Any]:
        """
        Tracks minimum and maximum duration limits and flags scholars approaching
        or exceeding boundary, plus stalled scholars without DC review progress.
        """
        today = date.today()
        scholars = self.db.query(PhDScholar).all()

        stalled = []
        approaching_max = []
        duration_compliant = []

        for s in scholars:
            # Days until max duration
            days_to_max = (s.max_duration_date - today).days
            years_enrolled = round((today - s.registration_date).days / 365.25, 2)

            is_past_max = days_to_max < 0
            is_near_max = 0 <= days_to_max <= 180 # within 6 months

            # Check if any overdue milestone
            overdue_milestones = [m for m in s.milestones if m.status == "Overdue" or (m.due_date < today and m.status != "Completed")]

            if is_past_max or len(overdue_milestones) >= 2:
                s.is_stalled = True
                s.stalled_reason = "Exceeded maximum duration limit" if is_past_max else f"Multiple overdue milestones ({len(overdue_milestones)})"
                stalled.append({
                    "scholar_id": s.id,
                    "reg_no": s.reg_no,
                    "name": s.name,
                    "mode": s.mode,
                    "admission_year": s.admission_year,
                    "years_enrolled": years_enrolled,
                    "supervisor": s.supervisor.name if s.supervisor else "Unassigned",
                    "reason": s.stalled_reason,
                    "overdue_milestones": [m.name for m in overdue_milestones]
                })
            else:
                s.is_stalled = False
                s.stalled_reason = None

            if is_near_max:
                approaching_max.append({
                    "scholar_id": s.id,
                    "reg_no": s.reg_no,
                    "name": s.name,
                    "days_remaining": days_to_max,
                    "max_date": s.max_duration_date.isoformat(),
                    "supervisor": s.supervisor.name if s.supervisor else "Unassigned"
                })

        self.db.commit()

        return {
            "total_scholars": len(scholars),
            "stalled_count": len(stalled),
            "approaching_max_count": len(approaching_max),
            "stalled_scholars": stalled,
            "approaching_max": approaching_max
        }

    def get_progress_dashboard(self) -> Dict[str, Any]:
        """
        Generates progress dashboards across scholars, supervisors, departments,
        and cohorts with milestone breakdown.
        """
        total_scholars = self.db.query(PhDScholar).count()
        mode_counts = {
            "Full-Time": self.db.query(PhDScholar).filter(PhDScholar.mode == "Full-Time").count(),
            "Part-Time": self.db.query(PhDScholar).filter(PhDScholar.mode == "Part-Time").count()
        }

        # Status distribution
        status_dist = {}
        for row in self.db.query(PhDScholar.current_status, func.count(PhDScholar.id)).group_by(PhDScholar.current_status).all():
            status_dist[row[0]] = row[1]

        # Cohort distribution
        cohort_dist = {}
        for row in self.db.query(PhDScholar.admission_year, func.count(PhDScholar.id)).group_by(PhDScholar.admission_year).order_by(PhDScholar.admission_year).all():
            cohort_dist[str(row[0])] = row[1]

        # Research Area distribution
        area_dist = {}
        for row in self.db.query(PhDScholar.research_area, func.count(PhDScholar.id)).group_by(PhDScholar.research_area).order_by(func.count(PhDScholar.id).desc()).limit(8).all():
            area_dist[row[0]] = row[1]

        return {
            "total_scholars": total_scholars,
            "mode_distribution": mode_counts,
            "status_distribution": status_dist,
            "cohort_distribution": cohort_dist,
            "research_area_distribution": area_dist
        }
