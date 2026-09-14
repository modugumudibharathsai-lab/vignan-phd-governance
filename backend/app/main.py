import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.config import settings
from backend.app.seed_data import seed_database
from backend.app.database import engine, Base
from backend.app.routes import (
    phd_routes, publication_routes, journal_routes, 
    productivity_routes, performance_routes, kpi_routes, auth_routes
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack university administration multi-agent platform for VFSTR (Vignan University).",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Agent API Routers
app.include_router(phd_routes.router, prefix=settings.API_V1_STR)
app.include_router(publication_routes.router, prefix=settings.API_V1_STR)
app.include_router(journal_routes.router, prefix=settings.API_V1_STR)
app.include_router(productivity_routes.router, prefix=settings.API_V1_STR)
app.include_router(performance_routes.router, prefix=settings.API_V1_STR)
app.include_router(kpi_routes.router, prefix=settings.API_V1_STR)
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()

@app.get("/api/overview")
def get_system_overview():
    from backend.app.database import SessionLocal
    from backend.app.models import PhDScholar, Faculty, Publication, Journal, UniversityKPI
    db = SessionLocal()
    try:
        scholars_count = db.query(PhDScholar).count()
        faculty_count = db.query(Faculty).count()
        pubs_count = db.query(Publication).count()
        journals_count = db.query(Journal).count()
        kpi_count = db.query(UniversityKPI).count()
        stalled_count = db.query(PhDScholar).filter(PhDScholar.is_stalled == True).count()
        
        return {
            "institution_name": settings.INSTITUTION_NAME,
            "short_name": settings.INSTITUTION_SHORT,
            "academic_year": settings.ACADEMIC_YEAR,
            "metrics": {
                "total_scholars": scholars_count,
                "stalled_scholars": stalled_count,
                "active_scholars": scholars_count - stalled_count,
                "total_faculty": faculty_count,
                "total_publications": pubs_count,
                "monitored_journals": journals_count,
                "strategic_kpis": kpi_count
            },
            "status": "Healthy - All 6 Institutional Agents Active"
        }
    finally:
        db.close()

# Frontend Static Files Mount
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
static_dir = os.path.join(frontend_dir, "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def serve_frontend_index():
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Frontend index.html not found, please check frontend build."}
