from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models import (
    Faculty, Department, Publication, PhDScholar, 
    ResearchProductivityScorecard
)

class ResearchProductivityAgent:
    """
    Agent 20: Research Productivity Agent
    Turns publication and research output data into quality-weighted,
    discipline-normalized longitudinal productivity scorecards, computing
    departmental Gini concentration curves and NIRF indicators.
    """

    QUARTILE_WEIGHTS = {
        "Q1": 15.0,
        "Q2": 10.0,
        "Q3": 5.0,
        "Q4": 2.0,
        "Unranked": 1.0
    }

    DISCIPLINE_NORMALIZATION_FACTORS = {
        "CSE": 1.0,           # Computer Science baseline
        "IT": 1.0,            # Information Technology
        "ACSE": 1.0,          # Advanced Computer Science
        "ECE": 1.1,           # Electronics (hardware/journal cycle)
        "Mech": 1.25,         # Mechanical Engineering
        "BT": 1.15,           # Biotechnology (wet lab experiments)
        "S & H": 1.4,         # Sciences & Humanities (monographs, slower cycles)
        "Mathematics": 1.35   # Pure Mathematics
    }

    def __init__(self, db: Session):
        self.db = db

    def compute_faculty_scorecard(self, faculty_id: int, academic_year: str = "2024-25") -> Dict[str, Any]:
        """
        Computes raw counts, quality-weighted score, and discipline-normalized score
        for an individual faculty member.
        """
        faculty = self.db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            return {"error": "Faculty not found"}

        pubs = self.db.query(Publication).filter(
            Publication.faculty_id == faculty.id,
            Publication.is_verified == True,
            Publication.is_flagged_predatory == False
        ).all()

        raw_count = len(pubs)
        quality_score = 0.0

        for p in pubs:
            base_wt = self.QUARTILE_WEIGHTS.get(p.quartile, 1.0)
            role_mult = 1.0 if p.is_scholar_first_or_corresponding else 0.8
            quality_score += (base_wt * role_mult)

        # PhD supervision points (from Agent 25)
        scholars_count = self.db.query(PhDScholar).filter(
            PhDScholar.supervisor_id == faculty.id,
            PhDScholar.current_status != "Graduated"
        ).count()
        graduated_count = self.db.query(PhDScholar).filter(
            PhDScholar.supervisor_id == faculty.id,
            PhDScholar.current_status == "Graduated"
        ).count()
        phd_points = (graduated_count * 20.0) + (scholars_count * 5.0)

        # Context normalization
        dept_code = faculty.department.code if faculty.department else "CSE"
        disc_factor = self.DISCIPLINE_NORMALIZATION_FACTORS.get(dept_code, 1.0)

        # Experience & teaching load adjustment
        exp_factor = max(0.8, min(1.3, 1.0 + ((15 - faculty.experience_years) * 0.02)))
        admin_relief = 1.25 if faculty.administrative_role in ["HoD", "Dean", "Director"] else 1.0
        
        normalized_score = round((quality_score + phd_points) * disc_factor * admin_relief, 2)

        # NIRF RPC contribution estimate
        nirf_rpc = round(min(100.0, (quality_score * 1.5) + (phd_points * 0.5)), 2)

        # Performance Band
        if normalized_score >= 80:
            band = "Outstanding Researcher"
            recommendation = "Eligible for Institutional Excellence Award & Seed Grant"
        elif normalized_score >= 45:
            band = "Commendable Contributor"
            recommendation = "Consistent contributor; eligible for Conference Travel Grant"
        elif normalized_score >= 20:
            band = "Satisfactory"
            recommendation = "Encourage collaborative cross-department research"
        else:
            band = "Developmental Support Needed"
            recommendation = "Route to Agent 60 (Faculty Research Mentorship & FDP support)"

        # Save or update scorecard
        scorecard = self.db.query(ResearchProductivityScorecard).filter(
            ResearchProductivityScorecard.faculty_id == faculty.id,
            ResearchProductivityScorecard.academic_year == academic_year
        ).first()

        if not scorecard:
            scorecard = ResearchProductivityScorecard(
                faculty_id=faculty.id,
                academic_year=academic_year,
                raw_publication_count=raw_count,
                quality_weighted_score=round(quality_score, 2),
                discipline_normalized_score=normalized_score,
                phd_supervision_points=phd_points,
                nirf_rpc_score=nirf_rpc,
                performance_band=band,
                support_recommendation=recommendation
            )
            self.db.add(scorecard)
        else:
            scorecard.raw_publication_count = raw_count
            scorecard.quality_weighted_score = round(quality_score, 2)
            scorecard.discipline_normalized_score = normalized_score
            scorecard.phd_supervision_points = phd_points
            scorecard.nirf_rpc_score = nirf_rpc
            scorecard.performance_band = band
            scorecard.support_recommendation = recommendation

        self.db.commit()

        return {
            "faculty_id": faculty.id,
            "name": faculty.name,
            "department": dept_code,
            "designation": faculty.designation,
            "administrative_role": faculty.administrative_role,
            "raw_publication_count": raw_count,
            "quality_weighted_score": round(quality_score, 2),
            "phd_supervision_points": phd_points,
            "discipline_normalized_score": normalized_score,
            "nirf_rpc_score": nirf_rpc,
            "performance_band": band,
            "support_recommendation": recommendation,
            "normalization_details": {
                "discipline_factor": disc_factor,
                "administrative_relief_multiplier": admin_relief,
                "teaching_hours_per_week": faculty.teaching_hours_per_week
            }
        }

    def compute_department_benchmarking_and_gini(self) -> Dict[str, Any]:
        """
        Computes departmental productivity benchmarks and the Gini coefficient
        measuring whether research output is concentrated in a few individuals or broadly shared.
        """
        faculty_members = self.db.query(Faculty).all()
        dept_scores: Dict[str, List[float]] = {}

        all_scores = []
        for f in faculty_members:
            card = self.compute_faculty_scorecard(f.id)
            score = card.get("discipline_normalized_score", 0.0)
            all_scores.append(score)
            dname = f.department.name if f.department else "CSE"
            dept_scores.setdefault(dname, []).append(score)

        # Compute Gini Coefficient across institution
        all_scores.sort()
        n = len(all_scores)
        if n == 0 or sum(all_scores) == 0:
            gini = 0.0
        else:
            cumulative_diffs = sum((2 * (i + 1) - n - 1) * s for i, s in enumerate(all_scores))
            total_sum = sum(all_scores)
            gini = round(cumulative_diffs / (n * total_sum), 3)

        # Department benchmarks
        dept_benchmarks = []
        for dept_name, scores in dept_scores.items():
            total = round(sum(scores), 2)
            avg = round(total / len(scores), 2) if scores else 0.0
            top_score = max(scores) if scores else 0.0
            dept_benchmarks.append({
                "department": dept_name,
                "faculty_count": len(scores),
                "total_productivity_score": total,
                "average_productivity_per_faculty": avg,
                "peak_faculty_score": top_score
            })

        dept_benchmarks.sort(key=lambda x: x["total_productivity_score"], reverse=True)

        return {
            "institutional_gini_coefficient": gini,
            "concentration_insight": "Healthy, broad participation across faculty" if gini < 0.40 else "High concentration in top researchers; developmental mentoring advised.",
            "top_10_percent_share_pct": round((sum(all_scores[-max(1, int(n*0.1)):]) / max(1.0, sum(all_scores))) * 100, 1),
            "department_benchmarks": dept_benchmarks
        }

    def get_recognition_and_support_lists(self) -> Dict[str, Any]:
        """
        Segregates high performers for institutional recognition and faculty needing
        research mentoring for developmental support.
        """
        faculty = self.db.query(Faculty).all()
        recognition = []
        support = []

        for f in faculty:
            card = self.compute_faculty_scorecard(f.id)
            score = card["discipline_normalized_score"]
            if score >= 60:
                recognition.append({
                    "faculty_id": f.id,
                    "name": f.name,
                    "dept": f.department.code if f.department else "CSE",
                    "score": score,
                    "band": card["performance_band"],
                    "pubs": card["raw_publication_count"]
                })
            elif score < 25:
                support.append({
                    "faculty_id": f.id,
                    "name": f.name,
                    "dept": f.department.code if f.department else "CSE",
                    "score": score,
                    "pubs": card["raw_publication_count"],
                    "recommendation": card["support_recommendation"]
                })

        return {
            "high_performers_count": len(recognition),
            "development_support_count": len(support),
            "recognition_roster": sorted(recognition, key=lambda x: x["score"], reverse=True),
            "development_support_queue": sorted(support, key=lambda x: x["score"])
        }
