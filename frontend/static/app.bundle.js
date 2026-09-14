const { useState, useEffect, useMemo } = React;
const API_BASE = (typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "http://127.0.0.1:8000") + "/api";
function App() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L;
  const [activeTab, setActiveTab] = useState("phd");
  const [personas, setPersonas] = useState([]);
  const [currentPersona, setCurrentPersona] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [scholars, setScholars] = useState([]);
  const [selectedScholar, setSelectedScholar] = useState(null);
  const [scholarSearch, setScholarSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [capacities, setCapacities] = useState([]);
  const [publications, setPublications] = useState([]);
  const [flaggedPubs, setFlaggedPubs] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [leadLag, setLeadLag] = useState([]);
  const [governanceBrief, setGovernanceBrief] = useState(null);
  const [departmentBenchmarks, setDepartmentBenchmarks] = useState(null);
  const [productivityScorecards, setProductivityScorecards] = useState([]);
  const [dossier, setDossier] = useState(null);
  const [journalQuery, setJournalQuery] = useState("2168-2267");
  const [journalResult, setJournalResult] = useState(null);
  const [approvedJournals, setApprovedJournals] = useState([]);
  const [isContesting, setIsContesting] = useState(false);
  const [contestReason, setContestReason] = useState("");
  const showNotice = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };
  useEffect(() => {
    fetchInitialData();
  }, []);
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [ovRes, perRes, schRes, capRes, pubRes, kpiRes, corRes, jnlRes] = await Promise.all([
        fetch(`${API_BASE}/overview`).then((r) => r.json()),
        fetch(`${API_BASE}/auth/personas`).then((r) => r.json()),
        fetch(`${API_BASE}/phd/scholars`).then((r) => r.json()),
        fetch(`${API_BASE}/phd/supervisor-capacities`).then((r) => r.json()),
        fetch(`${API_BASE}/publications/`).then((r) => r.json()),
        fetch(`${API_BASE}/kpis/cockpit`).then((r) => r.json()),
        fetch(`${API_BASE}/kpis/lead-lag-correlations`).then((r) => r.json()),
        fetch(`${API_BASE}/journals/approved-list`).then((r) => r.json())
      ]);
      setOverview(ovRes);
      setPersonas(perRes);
      if (perRes.length > 0) setCurrentPersona(perRes[1]);
      setScholars(schRes.scholars || []);
      if (schRes.scholars && schRes.scholars.length > 0) {
        loadScholarDetail(schRes.scholars[0].id);
      }
      setCapacities(capRes);
      setPublications(pubRes);
      setKpis(kpiRes);
      setLeadLag(corRes);
      setApprovedJournals(jnlRes);
      verifyJournal("2168-2267");
      fetch(`${API_BASE}/productivity/department-benchmarks`).then((r) => r.json()).then(setDepartmentBenchmarks);
      fetch(`${API_BASE}/productivity/scorecards`).then((r) => r.json()).then(setProductivityScorecards);
    } catch (err) {
      console.error("Failed to load initial data", err);
      showNotice("Connected to local backend: Initializing platform...", "info");
    } finally {
      setLoading(false);
    }
  };
  const loadScholarDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/phd/scholars/${id}`).then((r) => r.json());
      setSelectedScholar(res);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setTimeout(() => {
          const el = document.getElementById("scholar-dossier-panel");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    } catch (err) {
      console.error("Error loading scholar detail", err);
    }
  };
  const handleCompleteMilestone = async (scholarId, milestoneCode) => {
    try {
      const res = await fetch(`${API_BASE}/phd/scholars/${scholarId}/milestones/${milestoneCode}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          notes: "Verified and approved via Academic Governance System"
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotice(data.message || "Milestone completed successfully!", "success");
        loadScholarDetail(scholarId);
        fetch(`${API_BASE}/phd/scholars`).then((r) => r.json()).then((r) => setScholars(r.scholars || []));
      } else {
        showNotice(data.detail || "Milestone completion blocked!", "error");
      }
    } catch (err) {
      showNotice("Failed to update milestone", "error");
    }
  };
  const loadFacultyDossier = async (facultyId) => {
    try {
      const res = await fetch(`${API_BASE}/performance/dossier/${facultyId}`).then((r) => r.json());
      setDossier(res);
    } catch (err) {
      console.error("Error loading dossier", err);
    }
  };
  const verifyJournal = async (q) => {
    try {
      const res = await fetch(`${API_BASE}/journals/verify?query=${encodeURIComponent(q)}`).then((r) => r.json());
      setJournalResult(res);
    } catch (err) {
      console.error("Error verifying journal", err);
    }
  };
  const handlePersonaChange = (roleId) => {
    const p = personas.find((item) => item.role_id === roleId);
    if (!p) return;
    setCurrentPersona(p);
    if (p.role_id === "vice_chancellor") {
      setActiveTab("kpi");
      showNotice(`Switched persona to ${p.user_name} (Vice Chancellor) - Executive KPI Cockpit active.`);
    } else if (p.role_id === "dean_research") {
      setActiveTab("phd");
      showNotice(`Switched persona to ${p.user_name} (Dean of Research) - PhD Monitoring & Capacity Oversight active.`);
    } else if (p.role_id === "hod") {
      setActiveTab("performance");
      loadFacultyDossier(p.entity_id);
      showNotice(`Switched persona to ${p.user_name} (HoD CSE) - Faculty Performance & Appraisal active.`);
    } else if (p.role_id === "faculty_supervisor") {
      setActiveTab("journal");
      loadFacultyDossier(p.entity_id);
      showNotice(`Switched persona to ${p.user_name} (Supervisor) - Journal Verifier & Scholar Monitoring active.`);
    } else if (p.role_id === "phd_scholar") {
      setActiveTab("phd");
      const myScholar = scholars.find((s) => s.reg_no === p.reg_no) || scholars[0];
      if (myScholar) loadScholarDetail(myScholar.id);
      showNotice(`Switched persona to ${p.user_name} (PhD Scholar: ${p.reg_no}) - Tracking your personal doctoral roadmap.`);
    }
  };
  const handleSweep = async () => {
    try {
      const res = await fetch(`${API_BASE}/publications/sweep`, { method: "POST" }).then((r) => r.json());
      showNotice(`External Automated Sweep: ${res.faculty_checked} author registries synchronized with Scopus/WoS!`);
      const pubs = await fetch(`${API_BASE}/publications/`).then((r) => r.json());
      setPublications(pubs);
    } catch (err) {
      showNotice("Sweep trigger error", "error");
    }
  };
  const handleSyncKpis = async () => {
    try {
      const res = await fetch(`${API_BASE}/kpis/sync`, { method: "POST" }).then((r) => r.json());
      setKpis(res);
      showNotice("Live University KPIs recomputed and synchronized across all 6 agents!");
    } catch (err) {
      showNotice("KPI sync error", "error");
    }
  };
  const handleExportGovernanceBrief = async () => {
    try {
      const res = await fetch(`${API_BASE}/kpis/governance-brief`).then((r) => r.json());
      setGovernanceBrief(res);
      showNotice("Executive Governance Brief generated successfully!");
    } catch (err) {
      showNotice("Briefing error", "error");
    }
  };
  const handleContest = async () => {
    if (!dossier || !contestReason) return;
    try {
      const res = await fetch(`${API_BASE}/performance/contestation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossier_id: dossier.dossier_id,
          reason: contestReason
        })
      }).then((r) => r.json());
      showNotice(res.message);
      setIsContesting(false);
      setContestReason("");
      loadFacultyDossier(currentPersona.entity_id);
    } catch (err) {
      showNotice("Contestation submission failed", "error");
    }
  };
  const filteredScholars = useMemo(() => {
    return scholars.filter((s) => {
      const matchesSearch = !scholarSearch || s.name.toLowerCase().includes(scholarSearch.toLowerCase()) || s.reg_no.toLowerCase().includes(scholarSearch.toLowerCase()) || s.research_area.toLowerCase().includes(scholarSearch.toLowerCase());
      const matchesArea = !selectedArea || s.research_area.toLowerCase().includes(selectedArea.toLowerCase());
      return matchesSearch && matchesArea;
    });
  }, [scholars, scholarSearch, selectedArea]);
  if (loading) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold tracking-tight" }, "VFSTR Multi-Agent University Platform"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-1" }, "Booting Agents: 25, 17, 18, 20, 59, 71 & PostgreSQL Engine..."));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen flex flex-col bg-slate-50 text-slate-800" }, /* @__PURE__ */ React.createElement("header", { className: "bg-brand-900 text-white border-b border-slate-700 shadow-md sticky top-0 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md font-extrabold text-white text-lg" }, "V"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("h1", { className: "font-bold text-base md:text-lg tracking-tight leading-tight" }, "Vignan's Foundation for Science, Technology & Research"), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30" }, "NAAC A+ Deemed University")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Integrated Multi-Agent Academic & Doctoral Governance System"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400 px-2 font-medium" }, "Role:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "bg-slate-900 text-xs font-semibold text-white px-3 py-1.5 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer",
      value: (currentPersona == null ? void 0 : currentPersona.role_id) || "",
      onChange: (e) => handlePersonaChange(e.target.value)
    },
    personas.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.role_id, value: p.role_id }, p.role_title, ": ", p.user_name))
  ))), currentPersona && /* @__PURE__ */ React.createElement("div", { className: "bg-brand-800/90 border-t border-slate-800 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-white" }, currentPersona.user_name), /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "(", currentPersona.department, ")"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, currentPersona.description)), /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline-block text-[11px] text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded" }, "Active Badge: ", currentPersona.badge))), /* @__PURE__ */ React.createElement("nav", { className: "bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto custom-scrollbar py-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("phd"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "phd" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 25: PhD Monitoring (84 Scholars)")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("pubs"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "pubs" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 17: Faculty Research Publications")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("journal"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "journal" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 18: Journal Quartile Verifier")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("productivity"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "productivity" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 20: Research Productivity & Gini")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setActiveTab("performance");
        if (currentPersona) loadFacultyDossier(currentPersona.entity_id);
      },
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "performance" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 59: Faculty Performance & Appraisal")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("kpi"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "kpi" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 71: University KPI Cockpit")
  ))), notification && /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `fixed bottom-5 right-5 z-50 text-xs px-4 py-3 rounded-lg shadow-2xl border flex items-start space-x-2 max-w-md ${notification.type === "error" ? "bg-rose-950 text-rose-100 border-rose-500 shadow-rose-900/30" : notification.type === "warning" ? "bg-amber-950 text-amber-100 border-amber-500 shadow-amber-900/30" : "bg-slate-900 text-white border-blue-500/50 shadow-blue-900/20"}`
    },
    /* @__PURE__ */ React.createElement("span", {
      className: `w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${notification.type === "error" ? "bg-rose-400" : notification.type === "warning" ? "bg-amber-400" : "bg-emerald-400"}`
    }),
    /* @__PURE__ */ React.createElement("span", { className: "leading-snug" }, notification.msg)
  ), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full" }, activeTab === "phd" && /* @__PURE__ */ React.createElement(
    "div",
    { className: "space-y-6" },
    /* Executive Summary Bar */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "grid grid-cols-2 sm:grid-cols-5 gap-3" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-slate-500 uppercase tracking-wider" }, "Total Registered Scholars"),
        /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-slate-900 mt-1" }, scholars.length),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 mt-0.5" }, "Cohorts 2014 \u2013 2026")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-emerald-800 uppercase tracking-wider" }, "Submission Eligible"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-emerald-700 mt-1" },
          scholars.filter((s) => s.submission_eligibility_status === "SUBMISSION_ELIGIBLE").length,
          " Scholars"
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-emerald-600 mt-0.5" }, "Tier-1 + 12.0 pts satisfied")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-amber-800 uppercase tracking-wider" }, "Missing Tier-1 (Cat 1/2)"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-amber-700 mt-1" },
          scholars.filter((s) => s.submission_eligibility_status === "MISSING_TIER1").length,
          " Scholars"
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-amber-600 mt-0.5" }, "12+ pts, but lacks Cat 1/2")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-slate-500 uppercase tracking-wider" }, "Cap Limit Supervisors"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-amber-600 mt-1" },
          capacities.filter((c) => c.utilization_pct >= 100).length,
          " / ",
          capacities.length
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-amber-600 mt-0.5" }, "Prof (8), Assoc (6), Asst (4)")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-rose-800 uppercase tracking-wider" }, "Duration Stalled"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-rose-600 mt-1" },
          scholars.filter((s) => s.is_stalled).length,
          " Scholars"
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-rose-600 mt-0.5" }, "Exceeding max duration limits")
      )
    ),
    /* Supervisor Regulatory Capacity Enforcer */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "flex items-center justify-between mb-3" },
        /* @__PURE__ */ React.createElement(
          "div",
          null,
          /* @__PURE__ */ React.createElement(
            "h3",
            { className: "font-bold text-slate-900 text-sm flex items-center space-x-2" },
            /* @__PURE__ */ React.createElement("span", null, "Supervisor Regulatory Capacity Enforcer"),
            /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-normal px-2 py-0.5 rounded bg-amber-100 text-amber-800" }, "University Regulation Cap Monitor")
          ),
          /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Flags supervisors at or nearing capacity limits to prevent over-allocation delays.")
        )
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto custom-scrollbar p-1" },
        capacities.map((c) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: c.faculty_id,
            className: `p-3 rounded-lg border text-xs ${c.utilization_pct >= 100 ? "border-amber-300 bg-amber-50/60" : "border-slate-200 bg-slate-50"}`
          },
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex justify-between items-start" },
            /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 truncate" }, c.name),
            /* @__PURE__ */ React.createElement(
              "span",
              { className: `text-[10px] font-bold px-1.5 py-0.5 rounded ${c.utilization_pct >= 100 ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-800"}` },
              c.current_count,
              " / ",
              c.allowed_capacity
            )
          ),
          /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-0.5" }, c.designation, " (", c.department, ")"),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden" },
            /* @__PURE__ */ React.createElement("div", {
              className: `h-full ${c.utilization_pct >= 100 ? "bg-amber-500" : "bg-blue-600"}`,
              style: { width: `${Math.min(100, c.utilization_pct)}%` }
            })
          ),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex justify-between text-[10px] text-slate-500 mt-1" },
            /* @__PURE__ */ React.createElement("span", null, "Utilization: ", c.utilization_pct, "%"),
            c.utilization_pct >= 100 && /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-amber-700" }, "CAP SATURATED")
          )
        ))
      )
    ),
    /* Scholar Register & Dossier Split */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "grid grid-cols-1 lg:grid-cols-12 gap-6" },
      /* Left Directory */
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
          /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm" }, "Vignan PhD Scholar Directory (", filteredScholars.length, " of 84)"),
            /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Filter by research area, cohort year, or scholar identifier.")
          ),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex items-center space-x-2 w-full sm:w-auto" },
            /* @__PURE__ */ React.createElement("input", {
              type: "text",
              placeholder: "Search scholar, reg no, area...",
              value: scholarSearch,
              onChange: (e) => setScholarSearch(e.target.value),
              className: "text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
            }),
            /* @__PURE__ */ React.createElement(
              "select",
              {
                value: selectedArea,
                onChange: (e) => setSelectedArea(e.target.value),
                className: "text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              },
              /* @__PURE__ */ React.createElement("option", { value: "" }, "All Areas"),
              /* @__PURE__ */ React.createElement("option", { value: "ML" }, "Machine Learning"),
              /* @__PURE__ */ React.createElement("option", { value: "DL" }, "Deep Learning"),
              /* @__PURE__ */ React.createElement("option", { value: "NLP" }, "NLP"),
              /* @__PURE__ */ React.createElement("option", { value: "Networks" }, "Networks / CN"),
              /* @__PURE__ */ React.createElement("option", { value: "Cloud" }, "Cloud"),
              /* @__PURE__ */ React.createElement("option", { value: "Cryptography" }, "Cryptography / Sec"),
              /* @__PURE__ */ React.createElement("option", { value: "Image" }, "Image Processing")
            ),
            /* @__PURE__ */ React.createElement("a", {
              href: "/api/phd/export-json",
              download: "vignan_phd_scholars_data.json",
              target: "_blank",
              className: "px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm whitespace-nowrap"
            }, "\u{1F4E5} Export JSON")
          )
        ),
        /* Directory Table */
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "overflow-x-auto custom-scrollbar flex-1 max-h-[550px]" },
          /* @__PURE__ */ React.createElement(
            "table",
            { className: "w-full text-left text-xs" },
            /* @__PURE__ */ React.createElement(
              "thead",
              { className: "bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b" },
              /* @__PURE__ */ React.createElement(
                "tr",
                null,
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2.5" }, "Reg No"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2.5" }, "Scholar Name"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Area"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Year"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Supervisor"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Points"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Tier-1"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Eligibility"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Action")
              )
            ),
            /* @__PURE__ */ React.createElement(
              "tbody",
              { className: "divide-y divide-slate-100" },
              filteredScholars.map((s) => {
                const isSelected = (selectedScholar == null ? void 0 : selectedScholar.id) === s.id;
                const pts = s.cumulative_research_points || 0;
                const tier1 = s.tier1_publication_met;
                const statusBadge = s.submission_eligibility_status;
                return /* @__PURE__ */ React.createElement(
                  "tr",
                  {
                    key: s.id,
                    onClick: () => loadScholarDetail(s.id),
                    className: `cursor-pointer transition-colors hover:bg-blue-50/50 ${isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""}`
                  },
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2.5 font-mono font-bold text-slate-900" }, s.reg_no),
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2.5 font-medium text-slate-900 max-w-[130px] truncate" }, s.name),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2" },
                    /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700" }, s.research_area)
                  ),
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2 whitespace-nowrap" }, s.admission_year, " (", s.mode.slice(0, 2), ")"),
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2 text-slate-700 font-medium truncate max-w-[110px]" }, s.supervisor.name),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    /* @__PURE__ */ React.createElement("span", { className: `font-mono font-bold ${pts >= 12 ? "text-emerald-700" : "text-slate-700"}` }, pts.toFixed(1)),
                    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400" }, "/12")
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    tier1 ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800" }, "\u2713 Cat 1/2") : /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800" }, "\u2717 Missing")
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    statusBadge === "SUBMISSION_ELIGIBLE" ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300" }, "\u2713 Eligible") : statusBadge === "MISSING_TIER1" ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" }, "\u26A0\uFE0F Missing T-1") : statusBadge === "INSUFFICIENT_POINTS" ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" }, "Needs Pts") : /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600" }, "Pending")
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    /* @__PURE__ */ React.createElement("button", {
                      onClick: (e) => {
                        e.stopPropagation();
                        loadScholarDetail(s.id);
                      },
                      className: "text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                    }, "View \u2192")
                  )
                );
              })
            )
          )
        )
      ),
      /* Right Dossier Panel */
      /* @__PURE__ */ React.createElement(
        "div",
        { id: "scholar-dossier-panel", className: "lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col scroll-mt-24" },
        selectedScholar ? /* @__PURE__ */ React.createElement(
          "div",
          { className: "space-y-4" },
          /* Mobile Scroll-to-Top Helper */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "lg:hidden flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800" },
            /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "\u{1F4D6} Active Dossier"),
            /* @__PURE__ */ React.createElement("button", {
              onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
              className: "bg-blue-600 text-white font-bold px-2.5 py-1 rounded text-xs hover:bg-blue-700 transition"
            }, "\u2191 Directory List")
          ),
          /* Header */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "border-b pb-3 flex justify-between items-start" },
            /* @__PURE__ */ React.createElement(
              "div",
              null,
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "flex items-center space-x-2" },
                /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-base text-slate-900" }, selectedScholar.name),
                /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800" }, selectedScholar.reg_no)
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "text-xs text-slate-500 mt-1" },
                "Research Area: ",
                /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-800" }, selectedScholar.research_area),
                " \u2022 ",
                selectedScholar.mode
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "text-xs text-slate-500" },
                "Admitted: ",
                selectedScholar.admission_year,
                " \u2022 Phone: ",
                selectedScholar.phone || "N/A",
                " \u2022 Email: ",
                selectedScholar.email
              )
            ),
            /* @__PURE__ */ React.createElement("span", {
              className: `px-2 py-1 text-xs font-bold rounded ${selectedScholar.is_stalled ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`
            }, selectedScholar.current_status.replace(/_/g, " "))
          ),
          /* Stalled alert */
          selectedScholar.is_stalled && /* @__PURE__ */ React.createElement(
            "div",
            { className: "p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start space-x-2" },
            /* @__PURE__ */ React.createElement("span", { className: "font-bold text-rose-700" }, "\u26A0\uFE0F REGULATORY INTERVENTION:"),
            /* @__PURE__ */ React.createElement("span", null, selectedScholar.stalled_reason, ". Dean of Research review mandated.")
          ),
          /* DC Roster */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2" },
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "font-bold text-slate-800 flex items-center justify-between" },
              /* @__PURE__ */ React.createElement("span", null, "Doctoral Committee (DC) Roster"),
              /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-blue-600 font-semibold" }, "Constituted on Record")
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "grid grid-cols-2 gap-2 text-[11px]" },
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "Research Supervisor:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, selectedScholar.supervisor.name),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, selectedScholar.supervisor.designation)
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "External Expert:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, selectedScholar.doctoral_committee.external_expert_name || "N/A"),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, selectedScholar.doctoral_committee.external_expert_affiliation || "Premier Institute")
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "Internal Expert 1:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, selectedScholar.doctoral_committee.internal_expert1_name || "N/A"),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, selectedScholar.doctoral_committee.internal_expert1_dept)
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "Inter-School Nominee:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, selectedScholar.doctoral_committee.interschool_nominee_name || "N/A"),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, selectedScholar.doctoral_committee.interschool_nominee_dept)
              )
            )
          ),
          /* Dual-Condition Submission Eligibility Box */
          selectedScholar.publication_eligibility && /* @__PURE__ */ React.createElement(
            "div",
            { className: "bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3" },
            /* Header */
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "flex flex-wrap items-center justify-between gap-2 border-b pb-2" },
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement(
                  "h4",
                  { className: "font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5" },
                  /* @__PURE__ */ React.createElement("span", null, "PhD Submission Regulatory Compliance"),
                  /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800" }, "Dual-Condition Rule")
                ),
                /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500" }, "Enforces mandatory Tier-1 Publication (Cat 1/2) AND \u226512.0 cumulative points.")
              ),
              /* @__PURE__ */ React.createElement(
                "span",
                {
                  className: `px-2.5 py-1 rounded text-xs font-bold ${selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" ? "bg-amber-100 text-amber-900 border border-amber-300" : selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`
                },
                selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" && "\u2713 SUBMISSION ELIGIBLE",
                selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" && "\u26A0\uFE0F MISSING TIER-1 (CAT 1/2)",
                selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" && "\u26A0\uFE0F POINTS SHORTFALL",
                selectedScholar.publication_eligibility.status_badge === "NOT_ELIGIBLE" && "\u2717 NOT ELIGIBLE"
              )
            ),
            /* Prominent Status Banner */
            selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" && /* @__PURE__ */ React.createElement(
              "div",
              { className: "p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-950 space-y-1" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "font-bold text-amber-900 flex items-center space-x-1.5" },
                /* @__PURE__ */ React.createElement("span", null, "\u26A0\uFE0F Missing mandatory Category 1/2 Publication requirement.")
              ),
              /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-amber-900 leading-relaxed" }, selectedScholar.publication_eligibility.status_message)
            ),
            selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" && /* @__PURE__ */ React.createElement(
              "div",
              { className: "p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-xs text-blue-950 space-y-1" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "font-bold text-blue-900 flex items-center space-x-1.5" },
                /* @__PURE__ */ React.createElement("span", null, "\u2139\uFE0F Cumulative Research Points Shortfall")
              ),
              /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-blue-900 leading-relaxed" }, selectedScholar.publication_eligibility.status_message)
            ),
            selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" && /* @__PURE__ */ React.createElement(
              "div",
              { className: "p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-xs text-emerald-950 space-y-1" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "font-bold text-emerald-900 flex items-center space-x-1.5" },
                /* @__PURE__ */ React.createElement("span", null, "\u{1F389} Eligible for PhD Synopsis & Thesis Submission!")
              ),
              /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-emerald-900 leading-relaxed" }, selectedScholar.publication_eligibility.status_message)
            ),
            /* Dual Progress Indicators */
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
              /* Rule 1 Indicator */
              /* @__PURE__ */ React.createElement(
                "div",
                {
                  className: `p-3 rounded-lg border text-xs ${((_b = (_a = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _a.rule_1_tier1) == null ? void 0 : _b.satisfied) ? "bg-emerald-50/60 border-emerald-200" : "bg-amber-50/60 border-amber-200"}`
                },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between items-start mb-1" },
                  /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, "Rule 1: Tier-1 Publication"),
                  /* @__PURE__ */ React.createElement("span", {
                    className: `text-[10px] font-bold px-2 py-0.5 rounded ${((_d = (_c = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _c.rule_1_tier1) == null ? void 0 : _d.satisfied) ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"}`
                  }, ((_f = (_e = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _e.rule_1_tier1) == null ? void 0 : _f.satisfied) ? "SATISFIED" : "UNMET")
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "text-[11px] text-slate-600 mb-1.5" },
                  "Requires \u2265 1 paper in Category 1 (SCI/SCI-E, 5.0 pts) or Category 2 (Top-Notch Conf Level 1, 4.5 pts)."
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60" },
                  /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Qualifying Tier-1 Papers:"),
                  /* @__PURE__ */ React.createElement(
                    "span",
                    { className: "font-bold text-slate-900 font-mono" },
                    ((_h = (_g = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _g.rule_1_tier1) == null ? void 0 : _h.tier1_count) || 0,
                    " / 1 required"
                  )
                )
              ),
              /* Rule 2 Indicator */
              /* @__PURE__ */ React.createElement(
                "div",
                {
                  className: `p-3 rounded-lg border text-xs ${((_j = (_i = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _i.rule_2_cumulative_points) == null ? void 0 : _j.satisfied) ? "bg-emerald-50/60 border-emerald-200" : "bg-blue-50/60 border-blue-200"}`
                },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between items-start mb-1" },
                  /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, "Rule 2: Cumulative Points"),
                  /* @__PURE__ */ React.createElement("span", {
                    className: `text-[10px] font-bold px-2 py-0.5 rounded ${((_l = (_k = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _k.rule_2_cumulative_points) == null ? void 0 : _l.satisfied) ? "bg-emerald-200 text-emerald-900" : "bg-blue-200 text-blue-900"}`
                  }, ((_n = (_m = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _m.rule_2_cumulative_points) == null ? void 0 : _n.satisfied) ? "SATISFIED" : "IN PROGRESS")
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between text-[11px] text-slate-600 mb-1" },
                  /* @__PURE__ */ React.createElement("span", null, "Total Points Accumulated:"),
                  /* @__PURE__ */ React.createElement(
                    "span",
                    { className: "font-bold text-slate-900 font-mono" },
                    ((_p = (_o = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _o.rule_2_cumulative_points) == null ? void 0 : _p.current_points) || 0,
                    " / 12.0 pts"
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1" },
                  /* @__PURE__ */ React.createElement("div", {
                    className: `h-full transition-all duration-500 ${((_r = (_q = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _q.rule_2_cumulative_points) == null ? void 0 : _r.satisfied) ? "bg-emerald-500" : "bg-blue-500"}`,
                    style: { width: `${Math.min(100, ((_t = (_s = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _s.rule_2_cumulative_points) == null ? void 0 : _t.percentage) || 0)}%` }
                  })
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between text-[10px] text-slate-500" },
                  /* @__PURE__ */ React.createElement("span", null, "Progress: ", ((_v = (_u = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _u.rule_2_cumulative_points) == null ? void 0 : _v.percentage) || 0, "%"),
                  /* @__PURE__ */ React.createElement(
                    "span",
                    null,
                    ((_x = (_w = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _w.rule_2_cumulative_points) == null ? void 0 : _x.shortfall) > 0 ? `Shortfall: ${(_z = (_y = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _y.rule_2_cumulative_points) == null ? void 0 : _z.shortfall} pts` : `Surplus: +${(_B = (_A = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _A.rule_2_cumulative_points) == null ? void 0 : _B.surplus} pts`
                  )
                )
              )
            ),
            /* Points Distribution by Category */
            selectedScholar.publication_eligibility.category_point_distribution && Object.keys(selectedScholar.publication_eligibility.category_point_distribution).length > 0 && /* @__PURE__ */ React.createElement(
              "div",
              null,
              /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-semibold text-slate-700 mb-1" }, "Points Distribution by Category:"),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "flex flex-wrap gap-1.5" },
                Object.entries(selectedScholar.publication_eligibility.category_point_distribution).map(([cat, pts]) => /* @__PURE__ */ React.createElement(
                  "span",
                  { key: cat, className: "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200" },
                  /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[160px]" }, cat),
                  ": ",
                  /* @__PURE__ */ React.createElement("strong", { className: "ml-1 text-blue-700" }, pts, " pts")
                ))
              )
            ),
            /* Scored Research Outputs Breakdown */
            selectedScholar.publication_eligibility.research_outputs && selectedScholar.publication_eligibility.research_outputs.length > 0 && /* @__PURE__ */ React.createElement(
              "div",
              null,
              /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-semibold text-slate-700 mb-1" }, "Scored Research Outputs & Patents:"),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "max-h-36 overflow-y-auto custom-scrollbar space-y-1 pr-1" },
                selectedScholar.publication_eligibility.research_outputs.map((out, idx) => /* @__PURE__ */ React.createElement(
                  "div",
                  { key: idx, className: "p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex justify-between items-start gap-2" },
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "flex-1 min-w-0" },
                    /* @__PURE__ */ React.createElement("div", { className: "font-semibold text-slate-900 truncate" }, out.title),
                    /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 mt-0.5 truncate" }, out.venue, " \u2022 ", out.publication_year),
                    /* @__PURE__ */ React.createElement(
                      "div",
                      { className: "mt-1 flex items-center space-x-1.5" },
                      /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-200 text-slate-800" }, `Cat ${out.category_no}: ${out.category_name}`),
                      out.is_tier1 && /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800" }, "\u2605 TIER-1 MANDATORY")
                    )
                  ),
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "text-right whitespace-nowrap" },
                    /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200" }, `+${out.research_points.toFixed(1)} pts`)
                  )
                ))
              )
            )
          ),
          /* Milestone Regulatory Pipeline */
          /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "flex justify-between items-center mb-2" },
              /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-xs text-slate-900" }, "Milestone Regulatory Sequence"),
              /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500" }, "Dual condition verified before Pre-Sub / Synopsis")
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1" },
              selectedScholar.milestones.map((m, idx) => /* @__PURE__ */ React.createElement(
                "div",
                { key: m.id, className: "flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs" },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center space-x-2.5 min-w-0 flex-1" },
                  /* @__PURE__ */ React.createElement("div", {
                    className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${m.status === "Completed" ? "bg-emerald-500 text-white" : m.status === "Overdue" ? "bg-rose-500 text-white" : "bg-slate-300 text-slate-700"}`
                  }, m.status === "Completed" ? "\u2713" : idx + 1),
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "min-w-0" },
                    /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900 block truncate" }, m.name),
                    /* @__PURE__ */ React.createElement(
                      "span",
                      { className: "text-[10px] text-slate-500" },
                      "Due: ",
                      m.due_date,
                      m.completion_date ? ` \u2022 Done: ${m.completion_date}` : ""
                    )
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center space-x-2 flex-shrink-0 ml-2" },
                  /* @__PURE__ */ React.createElement("span", {
                    className: `text-[10px] font-bold px-2 py-0.5 rounded ${m.status === "Completed" ? "bg-emerald-100 text-emerald-800" : m.status === "Overdue" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"}`
                  }, m.status),
                  m.status !== "Completed" && /* @__PURE__ */ React.createElement("button", {
                    onClick: () => handleCompleteMilestone(selectedScholar.id, m.code),
                    className: "px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                  }, "Complete \u2192")
                )
              ))
            )
          )
        ) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center h-full text-slate-400 text-xs" }, "Select a scholar from the register to view detailed dossier")
      )
    )
  ), activeTab === "pubs" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 17: Faculty Research Publication Monitoring"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Maintains verified Scopus/WoS records, solves institutional affiliation variations, and catches predatory submissions.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSweep,
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
    },
    "\u26A1 Trigger External Ingestion Sweep"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `${API_BASE}/publications/accreditation-export`,
      target: "_blank",
      className: "px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
    },
    "Export NAAC/NIRF Proofs"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm mb-3" }, "Institutional Publication Repository (", publications.length, " Papers)"), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto custom-scrollbar max-h-[500px]" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Title & Authors"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Faculty Member"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Journal & ISSN"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Tier / Quartile"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Citations"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Status"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, publications.map((p) => /* @__PURE__ */ React.createElement("tr", { key: p.id, className: "hover:bg-slate-50" }, /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 max-w-sm" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-900" }, p.title), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 truncate" }, p.authors), p.doi && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-blue-600 font-mono mt-0.5" }, "DOI: ", p.doi)), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-medium text-slate-800" }, p.faculty_name || "Doctoral Scholar"), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-semibold text-slate-900" }, p.journal_name), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 font-mono" }, "ISSN: ", p.issn || "Online")), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${p.quartile === "Q1" ? "bg-emerald-100 text-emerald-800" : p.quartile === "Q2" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}` }, p.quartile)), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-bold text-slate-700" }, p.citations), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, p.is_flagged_predatory ? /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800" }, "FLAGGED: PREDATORY") : /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800" }, "VERIFIED"))))))))), activeTab === "journal" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-xl" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 18: Journal Quartile & Predatory Risk Verifier"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Verify venue before manuscript submission. Checks Web of Science, Scopus, UGC-CARE, delisting flags, and calculates predatory risk index."), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2 mt-4" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: journalQuery,
      onChange: (e) => setJournalQuery(e.target.value),
      placeholder: "Enter ISSN (e.g. 2168-2267) or Title (e.g. Pattern Recognition)",
      className: "flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => verifyJournal(journalQuery),
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
    },
    "Verify Venue"
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mt-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setJournalQuery("2168-2267");
    verifyJournal("2168-2267");
  }, className: "text-[11px] text-blue-600 underline" }, "Sample Q1: IEEE Trans Cybernetics"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setJournalQuery("1868-5137");
    verifyJournal("1868-5137");
  }, className: "text-[11px] text-rose-600 underline" }, "Sample Delisted: J Ambient Intelligence")))), journalResult && /* @__PURE__ */ React.createElement("div", { className: `p-6 rounded-xl border shadow-sm ${journalResult.verdict_badge === "REJECTED" ? "bg-rose-50/70 border-rose-200" : journalResult.verdict_badge === "CAUTION" ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-start justify-between gap-4 border-b pb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-slate-900" }, journalResult.title), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700" }, "ISSN: ", journalResult.canonical_issn)), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Publisher: ", /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-800" }, journalResult.publisher), " \u2022 Subject: ", journalResult.subject_category)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: `text-sm font-black px-3 py-1 rounded inline-block ${journalResult.verdict_badge === "REJECTED" ? "bg-rose-600 text-white" : journalResult.verdict_badge === "CAUTION" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"}` }, journalResult.verdict), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 mt-1" }, "Checked on: ", (_C = journalResult.verification_timestamp) == null ? void 0 : _C.slice(0, 10)))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 my-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "JCR Quartile (WoS)"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, ((_D = journalResult.quartiles) == null ? void 0 : _D.jcr_wos) || "N/A")), /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "CiteScore (Scopus)"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, ((_E = journalResult.metrics) == null ? void 0 : _E.citescore) || "N/A")), /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "Impact Factor"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, ((_F = journalResult.metrics) == null ? void 0 : _F.impact_factor) || "0.0")), /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "Peer Review Turnaround"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, (_G = journalResult.metrics) == null ? void 0 : _G.peer_review_turnaround_weeks, " Weeks"))), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-slate-900 text-white rounded-lg text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-300 block mb-1" }, "RECOMMENDATION VERDICT:"), journalResult.recommendation), ((_H = journalResult.risk_evidence) == null ? void 0 : _H.length) > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-4 p-3 bg-rose-100/70 border border-rose-300 rounded-lg text-xs text-rose-900" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold block mb-1" }, "\u{1F6A8} PREDATORY / DELISTING EVIDENCE:"), /* @__PURE__ */ React.createElement("ul", { className: "list-disc pl-4 space-y-0.5" }, journalResult.risk_evidence.map((rev, i) => /* @__PURE__ */ React.createElement("li", { key: i }, rev)))), ((_I = journalResult.alternatives) == null ? void 0 : _I.length) > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-4 border-t border-slate-200" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-xs text-slate-900 mb-2" }, "Recommended Reputable Alternative Venues (Q1 / Q2 Tier)"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, journalResult.alternatives.map((alt) => /* @__PURE__ */ React.createElement("div", { key: alt.id, className: "p-3 bg-white rounded-lg border border-slate-200 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 block truncate" }, alt.title), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[11px] text-slate-500 mt-1" }, /* @__PURE__ */ React.createElement("span", null, "ISSN: ", alt.issn), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-600" }, alt.quartile, " \u2022 IF ", alt.impact_factor)))))))), activeTab === "productivity" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 20: Research Productivity & Gini Concentration Engine"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Quality-weighted scores across quartiles (Q1: 15pts, Q2: 10pts), discipline normalization (CSE, ECE, Mech, S&H), and NIRF RPC computation."))), departmentBenchmarks && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-slate-500 uppercase" }, "Institutional Gini Index"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-blue-600 mt-1" }, departmentBenchmarks.institutional_gini_coefficient), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 mt-1" }, departmentBenchmarks.concentration_insight)), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-slate-500 uppercase" }, "Top 10% Output Concentration"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-indigo-600 mt-1" }, departmentBenchmarks.top_10_percent_share_pct, "%"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 mt-1" }, "Portion of total research points produced by top 10% faculty")), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-slate-500 uppercase" }, "NIRF RPC Score Projection"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-emerald-600 mt-1" }, "68.4 / 100"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 mt-1" }, "Accreditation component for Research and Professional Practice"))), (departmentBenchmarks == null ? void 0 : departmentBenchmarks.department_benchmarks) && /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm mb-3" }, "Departmental Research Benchmarking"), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto custom-scrollbar" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-100 text-slate-600 font-semibold border-b" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Department"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Faculty Count"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Total Productivity Points"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Avg Points / Faculty"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Top Faculty Score"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, departmentBenchmarks.department_benchmarks.map((dept, i) => /* @__PURE__ */ React.createElement("tr", { key: i, className: "hover:bg-slate-50" }, /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-bold text-slate-900" }, dept.department), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-medium text-slate-700" }, dept.faculty_count), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-bold text-blue-600" }, dept.total_productivity_score), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-semibold text-slate-800" }, dept.average_productivity_per_faculty), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono text-emerald-600 font-bold" }, dept.peak_faculty_score)))))))), activeTab === "performance" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 59: Faculty Performance & Annual Appraisal Dossier"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Auto-populates Teaching (35%), Research (35%), Administration (15%), and Outreach (15%) from platform records with context adjustments.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsContesting(true),
      className: "px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition"
    },
    "\u2696\uFE0F Contest Automated Calculation"
  )), dossier && /* @__PURE__ */ React.createElement("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-between items-start border-b pb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-slate-900" }, dossier.faculty_name), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800" }, dossier.designation, " \u2022 ", dossier.department)), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Appraisal Cycle: ", /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-800" }, dossier.academic_year), " \u2022 Status: ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-600" }, dossier.status))), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl font-black text-blue-600" }, dossier.aggregate_score, " ", /* @__PURE__ */ React.createElement("span", { className: "text-sm font-normal text-slate-400" }, "/ 100")), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800" }, dossier.performance_band))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Teaching & Learning (35%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.teaching.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, dossier.dimension_scores.teaching.teaching_hours, " Hours/week instruction")), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Research & Innovation (35%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.research.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, dossier.dimension_scores.research.publications_count, " Pubs (", dossier.dimension_scores.research.q1_q2_count, " Q1/Q2) \u2022 ", dossier.dimension_scores.research.phd_scholars_active, " PhDs")), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Administration (15%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.governance.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, "Role: ", dossier.dimension_scores.governance.role)), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Outreach & Mentorship (15%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.outreach.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, "Reviews, FDPs & Keynotes"))), /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Administrative Relief Multiplier: ", /* @__PURE__ */ React.createElement("strong", null, dossier.administrative_adjustment_factor, "x"), " applied to recognize heavy leadership workload without penalizing research output."), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded" }, "Traceable Audit Trail")), /* @__PURE__ */ React.createElement("div", { className: "border-t pt-4 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 block mb-1" }, "Agreed Performance Targets for Next Cycle:"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-600" }, dossier.agreed_next_cycle_goals))), isContesting && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-base text-slate-900" }, "Contest Automated Performance Calculation"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Submit formal contestation to the Dean of Research and IQAC committee with your justification."), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: contestReason,
      onChange: (e) => setContestReason(e.target.value),
      placeholder: "Explain reason for contestation (e.g. Uncounted Q1 journal published late in reporting cycle)...",
      className: "w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsContesting(false),
      className: "px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleContest,
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
    },
    "Submit Contestation"
  ))))), activeTab === "kpi" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 71: University Strategic Key Performance Indicator Cockpit"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Live institutional radar tracking Research, Doctoral Studies, Faculty, Governance, and NIRF / NAAC Frameworks.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSyncKpis,
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
    },
    "\u{1F504} Live KPI Sync"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleExportGovernanceBrief,
      className: "px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
    },
    "\u{1F4D1} Export Governance Briefing"
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, kpis.map((kpi) => {
    const isAmber = kpi.status === "On_Target_Deteriorating";
    const isGreen = kpi.status === "On_Target_Improving";
    const isRed = kpi.status === "Off_Target_Deteriorating";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: kpi.id,
        className: `p-5 rounded-xl border shadow-sm ${isAmber ? "bg-amber-50/60 border-amber-300" : isRed ? "bg-rose-50/60 border-rose-300" : "bg-white border-slate-200"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono" }, kpi.code, " \u2022 ", kpi.domain), /* @__PURE__ */ React.createElement("span", { className: `text-[10px] font-black px-2 py-0.5 rounded ${isAmber ? "bg-amber-200 text-amber-900" : isGreen ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}` }, kpi.status.replace(/_/g, " "))),
      /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm text-slate-900 mt-2" }, kpi.title),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline space-x-2 mt-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-black text-slate-900" }, kpi.current_value), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500 font-semibold" }, kpi.unit), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "/ Target: ", kpi.target_value)),
      isAmber && /* @__PURE__ */ React.createElement("div", { className: "mt-3 p-2 bg-amber-100/90 text-amber-900 rounded text-[11px] font-medium border border-amber-300" }, "\u26A0\uFE0F ", /* @__PURE__ */ React.createElement("strong", null, "EARLY WARNING:"), " Meeting target but declining from prior period (", kpi.prior_period_value, ")."),
      /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-3 border-t pt-2 space-y-0.5" }, /* @__PURE__ */ React.createElement("div", null, "Framework: ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, kpi.nirf_mapping)), /* @__PURE__ */ React.createElement("div", null, "Owner: ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, kpi.owner_role)))
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm mb-1" }, "Institutional Lead-Lag Predictive Relationships"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-4" }, "Understands cause-and-effect lags between operational inputs and downstream university ranking outputs."), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, leadLag.map((rel, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-700 font-mono" }, "Lag Time: ", rel.time_lag), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded" }, rel.correlation_strength)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px] uppercase font-bold" }, "Leading Input Indicator"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, rel.lead_indicator)), /* @__PURE__ */ React.createElement("div", { className: "text-center text-slate-400 font-bold" }, "\u2193 DIRECT IMPACT \u2193"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px] uppercase font-bold" }, "Lagging Outcome Indicator"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, rel.lag_indicator)), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1" }, rel.strategic_insight))))), governanceBrief && /* @__PURE__ */ React.createElement("div", { className: "bg-brand-900 text-white p-6 rounded-xl border border-slate-700 shadow-xl space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center border-b border-slate-700 pb-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-black text-base text-white" }, governanceBrief.report_title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-blue-300" }, governanceBrief.institution)), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono bg-blue-800/60 px-3 py-1 rounded border border-blue-600" }, "NIRF Trajectory: ", (_J = governanceBrief.nirf_score_projection) == null ? void 0 : _J.projected_rank_band)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "Monitored Indicators"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-white mt-1 block" }, governanceBrief.total_kpis_monitored)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "Target Compliance"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-emerald-400 mt-1 block" }, governanceBrief.on_target_pct, "%")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "Projected Overall Score"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-blue-400 mt-1 block" }, (_K = governanceBrief.nirf_score_projection) == null ? void 0 : _K.projected_overall_score)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "RPC Component Score"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-purple-400 mt-1 block" }, (_L = governanceBrief.nirf_score_projection) == null ? void 0 : _L.rpc_component_score)))))), /* @__PURE__ */ React.createElement("footer", { className: "bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2" }, /* @__PURE__ */ React.createElement("div", null, "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " Vignan's Foundation for Science, Technology & Research (VFSTR). Deemed to be University."), /* @__PURE__ */ React.createElement("div", { className: "flex space-x-4 text-[11px] text-slate-400" }, /* @__PURE__ */ React.createElement("span", null, "FastAPI 0.141 Backend"), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "PostgreSQL Schema Ready"), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "React 18 / Tailwind CSS")))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
