const { useState, useEffect, useMemo } = React;

    const API_BASE = (typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "http://127.0.0.1:8000") + "/api";

    function App() {
      // Navigation & Role State
      const [activeTab, setActiveTab] = useState("phd");
      const [personas, setPersonas] = useState([]);
      const [currentPersona, setCurrentPersona] = useState(null);
      const [overview, setOverview] = useState(null);
      const [loading, setLoading] = useState(true);
      const [notification, setNotification] = useState(null);

      // Data States
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

      // Contestation modal state
      const [isContesting, setIsContesting] = useState(false);
      const [contestReason, setContestReason] = useState("");

      const showNotice = (msg, type = "success") => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4500);
      };

      // Initial Fetch
      useEffect(() => {
        fetchInitialData();
      }, []);

      const fetchInitialData = async () => {
        try {
          setLoading(true);
          const [ovRes, perRes, schRes, capRes, pubRes, kpiRes, corRes, jnlRes] = await Promise.all([
            fetch(`${API_BASE}/overview`).then(r => r.json()),
            fetch(`${API_BASE}/auth/personas`).then(r => r.json()),
            fetch(`${API_BASE}/phd/scholars`).then(r => r.json()),
            fetch(`${API_BASE}/phd/supervisor-capacities`).then(r => r.json()),
            fetch(`${API_BASE}/publications/`).then(r => r.json()),
            fetch(`${API_BASE}/kpis/cockpit`).then(r => r.json()),
            fetch(`${API_BASE}/kpis/lead-lag-correlations`).then(r => r.json()),
            fetch(`${API_BASE}/journals/approved-list`).then(r => r.json())
          ]);

          setOverview(ovRes);
          setPersonas(perRes);
          if (perRes.length > 0) setCurrentPersona(perRes[1]); // Default to Dean of Research
          setScholars(schRes.scholars || []);
          if (schRes.scholars && schRes.scholars.length > 0) {
            loadScholarDetail(schRes.scholars[0].id);
          }
          setCapacities(capRes);
          setPublications(pubRes);
          setKpis(kpiRes);
          setLeadLag(corRes);
          setApprovedJournals(jnlRes);
          
          // Load default journal check
          verifyJournal("2168-2267");
          // Load benchmarks
          fetch(`${API_BASE}/productivity/department-benchmarks`).then(r => r.json()).then(setDepartmentBenchmarks);
          fetch(`${API_BASE}/productivity/scorecards`).then(r => r.json()).then(setProductivityScorecards);
        } catch (err) {
          console.error("Failed to load initial data", err);
          showNotice("Connected to local backend: Initializing platform...", "info");
        } finally {
          setLoading(false);
        }
      };

      const loadScholarDetail = async (id) => {
        try {
          const res = await fetch(`${API_BASE}/phd/scholars/${id}`).then(r => r.json());
          setSelectedScholar(res);
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
            fetch(`${API_BASE}/phd/scholars`).then(r => r.json()).then(r => setScholars(r.scholars || []));
          } else {
            showNotice(data.detail || "Milestone completion blocked!", "error");
          }
        } catch (err) {
          showNotice("Failed to update milestone", "error");
        }
      };

      const loadFacultyDossier = async (facultyId) => {
        try {
          const res = await fetch(`${API_BASE}/performance/dossier/${facultyId}`).then(r => r.json());
          setDossier(res);
        } catch (err) {
          console.error("Error loading dossier", err);
        }
      };

      const verifyJournal = async (q) => {
        try {
          const res = await fetch(`${API_BASE}/journals/verify?query=${encodeURIComponent(q)}`).then(r => r.json());
          setJournalResult(res);
        } catch (err) {
          console.error("Error verifying journal", err);
        }
      };

      const handlePersonaChange = (roleId) => {
        const p = personas.find(item => item.role_id === roleId);
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
          const myScholar = scholars.find(s => s.reg_no === p.reg_no) || scholars[0];
          if (myScholar) loadScholarDetail(myScholar.id);
          showNotice(`Switched persona to ${p.user_name} (PhD Scholar: ${p.reg_no}) - Tracking your personal doctoral roadmap.`);
        }
      };

      const handleSweep = async () => {
        try {
          const res = await fetch(`${API_BASE}/publications/sweep`, { method: "POST" }).then(r => r.json());
          showNotice(`External Automated Sweep: ${res.faculty_checked} author registries synchronized with Scopus/WoS!`);
          const pubs = await fetch(`${API_BASE}/publications/`).then(r => r.json());
          setPublications(pubs);
        } catch (err) {
          showNotice("Sweep trigger error", "error");
        }
      };

      const handleSyncKpis = async () => {
        try {
          const res = await fetch(`${API_BASE}/kpis/sync`, { method: "POST" }).then(r => r.json());
          setKpis(res);
          showNotice("Live University KPIs recomputed and synchronized across all 6 agents!");
        } catch (err) {
          showNotice("KPI sync error", "error");
        }
      };

      const handleExportGovernanceBrief = async () => {
        try {
          const res = await fetch(`${API_BASE}/kpis/governance-brief`).then(r => r.json());
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
          }).then(r => r.json());
          showNotice(res.message);
          setIsContesting(false);
          setContestReason("");
          loadFacultyDossier(currentPersona.entity_id);
        } catch (err) {
          showNotice("Contestation submission failed", "error");
        }
      };

      const filteredScholars = useMemo(() => {
        return scholars.filter(s => {
          const matchesSearch = !scholarSearch || 
            s.name.toLowerCase().includes(scholarSearch.toLowerCase()) || 
            s.reg_no.toLowerCase().includes(scholarSearch.toLowerCase()) ||
            s.research_area.toLowerCase().includes(scholarSearch.toLowerCase());
          const matchesArea = !selectedArea || s.research_area.toLowerCase().includes(selectedArea.toLowerCase());
          return matchesSearch && matchesArea;
        });
      }, [scholars, scholarSearch, selectedArea]);

      if (loading) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold tracking-tight">VFSTR Multi-Agent University Platform</h2>
            <p className="text-slate-400 text-sm mt-1">Booting Agents: 25, 17, 18, 20, 59, 71 & PostgreSQL Engine...</p>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          {/* Top Institutional Header */}
          <header className="bg-brand-900 text-white border-b border-slate-700 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md font-extrabold text-white text-lg">
                  V
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="font-bold text-base md:text-lg tracking-tight leading-tight">
                      Vignan's Foundation for Science, Technology & Research
                    </h1>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      NAAC A+ Deemed University
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Integrated Multi-Agent Academic & Doctoral Governance System</p>
                </div>
              </div>

              {/* Persona Switcher */}
              <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
                <span className="text-xs text-slate-400 px-2 font-medium">Role:</span>
                <select 
                  className="bg-slate-900 text-xs font-semibold text-white px-3 py-1.5 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  value={currentPersona?.role_id || ""}
                  onChange={(e) => handlePersonaChange(e.target.value)}
                >
                  {personas.map(p => (
                    <option key={p.role_id} value={p.role_id}>
                      {p.role_title}: {p.user_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Persona Description Banner */}
            {currentPersona && (
              <div className="bg-brand-800/90 border-t border-slate-800 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-medium text-white">{currentPersona.user_name}</span>
                  <span className="text-slate-400">({currentPersona.department})</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{currentPersona.description}</span>
                </div>
                <span className="hidden md:inline-block text-[11px] text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded">
                  Active Badge: {currentPersona.badge}
                </span>
              </div>
            )}
          </header>

          {/* Agent Navigation Tabs */}
          <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40">
            <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto custom-scrollbar py-2">
              <button
                onClick={() => setActiveTab("phd")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === "phd" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Agent 25: PhD Monitoring (84 Scholars)</span>
              </button>
              <button
                onClick={() => setActiveTab("pubs")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === "pubs" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Agent 17: Faculty Research Publications</span>
              </button>
              <button
                onClick={() => setActiveTab("journal")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === "journal" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Agent 18: Journal Quartile Verifier</span>
              </button>
              <button
                onClick={() => setActiveTab("productivity")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === "productivity" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Agent 20: Research Productivity & Gini</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("performance");
                  if (currentPersona) loadFacultyDossier(currentPersona.entity_id);
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === "performance" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Agent 59: Faculty Performance & Appraisal</span>
              </button>
              <button
                onClick={() => setActiveTab("kpi")}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === "kpi" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Agent 71: University KPI Cockpit</span>
              </button>
            </div>
          </nav>

          {/* Toast Notification */}
          {notification && (
            <div className={`fixed bottom-5 right-5 z-50 text-xs px-4 py-3 rounded-lg shadow-2xl border flex items-start space-x-2 max-w-md ${
              notification.type === "error" 
                ? "bg-rose-950 text-rose-100 border-rose-500 shadow-rose-900/30" 
                : notification.type === "warning"
                ? "bg-amber-950 text-amber-100 border-amber-500 shadow-amber-900/30"
                : "bg-slate-900 text-white border-blue-500/50 shadow-blue-900/20"
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${
                notification.type === "error" ? "bg-rose-400" : notification.type === "warning" ? "bg-amber-400" : "bg-emerald-400"
              }`}></span>
              <span className="leading-snug">{notification.msg}</span>
            </div>
          )}

          {/* Main Workspace Body */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
            {/* AGENT 25: PhD MONITORING */}
            {activeTab === "phd" && (
              <div className="space-y-6">
                {/* Executive Summary Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Registered Scholars</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{scholars.length}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Cohorts 2014 – 2026</div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
                    <div className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">Submission Eligible</div>
                    <div className="text-2xl font-bold text-emerald-700 mt-1">
                      {scholars.filter(s => s.submission_eligibility_status === "SUBMISSION_ELIGIBLE").length} Scholars
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">Tier-1 + 12.0 pts satisfied</div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm">
                    <div className="text-[11px] font-medium text-amber-800 uppercase tracking-wider">Missing Tier-1 (Cat 1/2)</div>
                    <div className="text-2xl font-bold text-amber-700 mt-1">
                      {scholars.filter(s => s.submission_eligibility_status === "MISSING_TIER1").length} Scholars
                    </div>
                    <div className="text-[10px] text-amber-600 mt-0.5">12+ pts, but lacks Cat 1/2</div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cap Limit Supervisors</div>
                    <div className="text-2xl font-bold text-amber-600 mt-1">
                      {capacities.filter(c => c.utilization_pct >= 100).length} / {capacities.length}
                    </div>
                    <div className="text-[10px] text-amber-600 mt-0.5">Prof (8), Assoc (6), Asst (4)</div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
                    <div className="text-[11px] font-medium text-rose-800 uppercase tracking-wider">Duration Stalled</div>
                    <div className="text-2xl font-bold text-rose-600 mt-1">
                      {scholars.filter(s => s.is_stalled).length} Scholars
                    </div>
                    <div className="text-[10px] text-rose-600 mt-0.5">Exceeding max duration limits</div>
                  </div>
                </div>

                {/* Supervisor Capacity Warning Section */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                        <span>Supervisor Regulatory Capacity Enforcer</span>
                        <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          University Regulation Cap Monitor
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">Flags supervisors at or nearing capacity limits to prevent over-allocation delays.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto custom-scrollbar p-1">
                    {capacities.map(c => (
                      <div 
                        key={c.faculty_id} 
                        className={`p-3 rounded-lg border text-xs ${
                          c.utilization_pct >= 100 
                            ? "border-amber-300 bg-amber-50/60" 
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900 truncate">{c.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            c.utilization_pct >= 100 ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {c.current_count} / {c.allowed_capacity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{c.designation} ({c.department})</div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full ${c.utilization_pct >= 100 ? 'bg-amber-500' : 'bg-blue-600'}`} 
                            style={{ width: `${Math.min(100, c.utilization_pct)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>Utilization: {c.utilization_pct}%</span>
                          {c.utilization_pct >= 100 && <span className="font-semibold text-amber-700">CAP SATURATED</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Split: 84 Scholar Table + Scholar Detailed Dossier */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Scholar Directory (84 Scholars) */}
                  <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Vignan PhD Scholar Directory ({filteredScholars.length} of 84)</h3>
                        <p className="text-xs text-slate-500">Filter by research area, cohort year, or scholar identifier.</p>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Search scholar, reg no, area..."
                          value={scholarSearch}
                          onChange={(e) => setScholarSearch(e.target.value)}
                          className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                        />
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
                        >
                          <option value="">All Areas</option>
                          <option value="ML">Machine Learning</option>
                          <option value="DL">Deep Learning</option>
                          <option value="NLP">NLP</option>
                          <option value="Networks">Networks / CN</option>
                          <option value="Cloud">Cloud</option>
                          <option value="Cryptography">Cryptography / Sec</option>
                          <option value="Image">Image Processing</option>
                        </select>
                        <a
                          href="/api/phd/export-json"
                          download="vignan_phd_scholars_data.json"
                          target="_blank"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm whitespace-nowrap"
                        >
                          📥 Export JSON
                        </a>
                      </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar flex-1 max-h-[550px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b">
                          <tr>
                            <th className="py-2.5 px-2.5">Reg No</th>
                            <th className="py-2.5 px-2.5">Scholar Name</th>
                            <th className="py-2.5 px-2">Area</th>
                            <th className="py-2.5 px-2">Year</th>
                            <th className="py-2.5 px-2">Supervisor</th>
                            <th className="py-2.5 px-2">Points</th>
                            <th className="py-2.5 px-2">Tier-1</th>
                            <th className="py-2.5 px-2">Eligibility</th>
                            <th className="py-2.5 px-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredScholars.map(s => {
                            const isSelected = selectedScholar?.id === s.id;
                            const pts = s.cumulative_research_points || 0.0;
                            const tier1 = s.tier1_publication_met;
                            const statusBadge = s.submission_eligibility_status;
                            return (
                              <tr 
                                key={s.id} 
                                onClick={() => loadScholarDetail(s.id)}
                                className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${
                                  isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""
                                }`}
                              >
                                <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">{s.reg_no}</td>
                                <td className="py-2.5 px-2.5 font-medium text-slate-900 max-w-[130px] truncate">{s.name}</td>
                                <td className="py-2.5 px-2">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                    {s.research_area}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 whitespace-nowrap">{s.admission_year} ({s.mode.slice(0,2)})</td>
                                <td className="py-2.5 px-2 text-slate-700 font-medium truncate max-w-[110px]">
                                  {s.supervisor.name}
                                </td>
                                <td className="py-2.5 px-2 whitespace-nowrap">
                                  <span className={`font-mono font-bold ${pts >= 12.0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                                    {pts.toFixed(1)}
                                  </span>
                                  <span className="text-[10px] text-slate-400">/12</span>
                                </td>
                                <td className="py-2.5 px-2 whitespace-nowrap">
                                  {tier1 ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      ✓ Cat 1/2
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                      ✗ Missing
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 whitespace-nowrap">
                                  {statusBadge === "SUBMISSION_ELIGIBLE" ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      ✓ Eligible
                                    </span>
                                  ) : statusBadge === "MISSING_TIER1" ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                      ⚠️ Missing T-1
                                    </span>
                                  ) : statusBadge === "INSUFFICIENT_POINTS" ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      Needs Pts
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-2 whitespace-nowrap">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); loadScholarDetail(s.id); }}
                                    className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                                  >
                                    View &rarr;
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detailed Scholar Dossier */}
                  <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    {selectedScholar ? (
                      <div className="space-y-4">
                        <div className="border-b pb-3 flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-base text-slate-900">{selectedScholar.name}</h3>
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                {selectedScholar.reg_no}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Research Area: <span className="font-semibold text-slate-800">{selectedScholar.research_area}</span> • {selectedScholar.mode}
                            </div>
                            <div className="text-xs text-slate-500">
                              Admitted: {selectedScholar.admission_year} • Phone: {selectedScholar.phone || "N/A"} • Email: {selectedScholar.email}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-bold rounded ${
                            selectedScholar.is_stalled ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {selectedScholar.current_status.replace(/_/g, " ")}
                          </span>
                        </div>

                        {/* Stalled Alert if applicable */}
                        {selectedScholar.is_stalled && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start space-x-2">
                            <span className="font-bold text-rose-700">⚠️ REGULATORY INTERVENTION:</span>
                            <span>{selectedScholar.stalled_reason}. Dean of Research review mandated.</span>
                          </div>
                        )}

                        {/* Supervisor & Committee Panel */}
                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>Doctoral Committee (DC) Roster</span>
                            <span className="text-[10px] text-blue-600 font-semibold">Constituted on Record</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500 block">Research Supervisor:</span>
                              <span className="font-semibold text-slate-900">{selectedScholar.supervisor.name}</span>
                              <span className="text-slate-500 block text-[10px]">{selectedScholar.supervisor.designation}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">External Expert:</span>
                              <span className="font-semibold text-slate-900">{selectedScholar.doctoral_committee.external_expert_name || "N/A"}</span>
                              <span className="text-slate-500 block text-[10px]">{selectedScholar.doctoral_committee.external_expert_affiliation || "Premier Institute"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Internal Expert 1:</span>
                              <span className="font-medium text-slate-800">{selectedScholar.doctoral_committee.internal_expert1_name || "N/A"}</span>
                              <span className="text-slate-500 block text-[10px]">{selectedScholar.doctoral_committee.internal_expert1_dept}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Inter-School Nominee:</span>
                              <span className="font-medium text-slate-800">{selectedScholar.doctoral_committee.interschool_nominee_name || "N/A"}</span>
                              <span className="text-slate-500 block text-[10px]">{selectedScholar.doctoral_committee.interschool_nominee_dept}</span>
                            </div>
                          </div>
                        </div>

                        {/* Dual-Condition PhD Submission Eligibility Section (Agent 25 & 17) */}
                        {selectedScholar.publication_eligibility && (
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                              <div>
                                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                  <span>PhD Submission Regulatory Compliance</span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                    Dual-Condition Rule
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Enforces mandatory Tier-1 Publication (Cat 1/2) AND &ge;12.0 cumulative points.
                                </p>
                              </div>
                              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                                selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}>
                                {selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" && "✓ SUBMISSION ELIGIBLE"}
                                {selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" && "⚠️ MISSING TIER-1 (CAT 1/2)"}
                                {selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" && "⚠️ POINTS SHORTFALL"}
                                {selectedScholar.publication_eligibility.status_badge === "NOT_ELIGIBLE" && "✗ NOT ELIGIBLE"}
                              </span>
                            </div>

                            {/* Explicit Status & Warning Banner */}
                            {selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" && (
                              <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-950 space-y-1">
                                <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                                  <span>⚠️ Missing mandatory Category 1/2 Publication requirement.</span>
                                </div>
                                <p className="text-[11px] text-amber-900 leading-relaxed">
                                  {selectedScholar.publication_eligibility.status_message}
                                </p>
                              </div>
                            )}

                            {selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" && (
                              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-xs text-blue-950 space-y-1">
                                <div className="font-bold text-blue-900 flex items-center space-x-1.5">
                                  <span>ℹ️ Cumulative Research Points Shortfall</span>
                                </div>
                                <p className="text-[11px] text-blue-900 leading-relaxed">
                                  {selectedScholar.publication_eligibility.status_message}
                                </p>
                              </div>
                            )}

                            {selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" && (
                              <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-xs text-emerald-950 space-y-1">
                                <div className="font-bold text-emerald-900 flex items-center space-x-1.5">
                                  <span>🎉 Eligible for PhD Synopsis & Thesis Submission!</span>
                                </div>
                                <p className="text-[11px] text-emerald-900 leading-relaxed">
                                  {selectedScholar.publication_eligibility.status_message}
                                </p>
                              </div>
                            )}

                            {/* Dual Progress Indicators */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Indicator 1: Mandatory Category 1 / 2 Publication */}
                              <div className={`p-3 rounded-lg border text-xs ${
                                selectedScholar.publication_eligibility.dual_conditions?.rule_1_tier1?.satisfied
                                  ? "bg-emerald-50/60 border-emerald-200"
                                  : "bg-amber-50/60 border-amber-200"
                              }`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-900">Rule 1: Tier-1 Publication</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    selectedScholar.publication_eligibility.dual_conditions?.rule_1_tier1?.satisfied
                                      ? "bg-emerald-200 text-emerald-900"
                                      : "bg-amber-200 text-amber-900"
                                  }`}>
                                    {selectedScholar.publication_eligibility.dual_conditions?.rule_1_tier1?.satisfied ? "SATISFIED" : "UNMET"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-600 mb-1.5">
                                  Requires &ge; 1 paper in Category 1 (SCI/SCI-E, 5.0 pts) or Category 2 (Top-Notch Conf Level 1, 4.5 pts).
                                </div>
                                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                                  <span className="text-slate-500">Qualifying Tier-1 Papers:</span>
                                  <span className="font-bold text-slate-900 font-mono">
                                    {selectedScholar.publication_eligibility.dual_conditions?.rule_1_tier1?.tier1_count || 0} / 1 required
                                  </span>
                                </div>
                              </div>

                              {/* Indicator 2: Cumulative Research Points */}
                              <div className={`p-3 rounded-lg border text-xs ${
                                selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.satisfied
                                  ? "bg-emerald-50/60 border-emerald-200"
                                  : "bg-blue-50/60 border-blue-200"
                              }`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-900">Rule 2: Cumulative Points</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.satisfied
                                      ? "bg-emerald-200 text-emerald-900"
                                      : "bg-blue-200 text-blue-900"
                                  }`}>
                                    {selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.satisfied ? "SATISFIED" : "IN PROGRESS"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                                  <span>Total Points Accumulated:</span>
                                  <span className="font-bold text-slate-900 font-mono">
                                    {selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.current_points || 0} / 12.0 pts
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.satisfied
                                        ? "bg-emerald-500"
                                        : "bg-blue-500"
                                    }`}
                                    style={{ width: `${Math.min(100, selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.percentage || 0)}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>Progress: {selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.percentage || 0}%</span>
                                  <span>
                                    {selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.shortfall > 0
                                      ? `Shortfall: ${selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.shortfall} pts`
                                      : `Surplus: +${selectedScholar.publication_eligibility.dual_conditions?.rule_2_cumulative_points?.surplus} pts`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Points Distribution Summary */}
                            {selectedScholar.publication_eligibility.category_point_distribution && Object.keys(selectedScholar.publication_eligibility.category_point_distribution).length > 0 && (
                              <div>
                                <div className="text-[11px] font-semibold text-slate-700 mb-1">Points Distribution by Category:</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(selectedScholar.publication_eligibility.category_point_distribution).map(([cat, pts]) => (
                                    <span key={cat} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                      <span className="truncate max-w-[160px]">{cat}</span>: <strong className="ml-1 text-blue-700">{pts} pts</strong>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Verified Research Outputs Breakdown */}
                            {selectedScholar.publication_eligibility.research_outputs && selectedScholar.publication_eligibility.research_outputs.length > 0 && (
                              <div>
                                <div className="text-[11px] font-semibold text-slate-700 mb-1">Scored Research Outputs & Patents:</div>
                                <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                                  {selectedScholar.publication_eligibility.research_outputs.map((out, idx) => (
                                    <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex justify-between items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-900 truncate">{out.title}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                                          {out.venue} • {out.publication_year}
                                        </div>
                                        <div className="mt-1 flex items-center space-x-1.5">
                                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-200 text-slate-800">
                                            Cat {out.category_no}: {out.category_name}
                                          </span>
                                          {out.is_tier1 && (
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                                              ★ TIER-1 MANDATORY
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right whitespace-nowrap">
                                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                          +{out.research_points.toFixed(1)} pts
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Milestone Regulatory Pipeline with Interactive Verification Guard */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-xs text-slate-900">Milestone Regulatory Sequence</h4>
                            <span className="text-[10px] text-slate-500">Dual condition verified before Pre-Sub / Synopsis</span>
                          </div>
                          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                            {selectedScholar.milestones.map((m, idx) => (
                              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                    m.status === "Completed" ? "bg-emerald-500 text-white" : (m.status === "Overdue" ? "bg-rose-500 text-white" : "bg-slate-300 text-slate-700")
                                  }`}>
                                    {m.status === "Completed" ? "✓" : idx + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-slate-900 block truncate">{m.name}</span>
                                    <span className="text-[10px] text-slate-500">Due: {m.due_date} {m.completion_date ? `• Done: ${m.completion_date}` : ""}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    m.status === "Completed" ? "bg-emerald-100 text-emerald-800" : (m.status === "Overdue" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700")
                                  }`}>
                                    {m.status}
                                  </span>
                                  {m.status !== "Completed" && (
                                    <button
                                      onClick={() => handleCompleteMilestone(selectedScholar.id, m.code)}
                                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                      Complete &rarr;
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        Select a scholar from the register to view detailed dossier
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AGENT 17: FACULTY PUBLICATIONS */}
            {activeTab === "pubs" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Agent 17: Faculty Research Publication Monitoring</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Maintains verified Scopus/WoS records, solves institutional affiliation variations, and catches predatory submissions.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleSweep}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
                    >
                      ⚡ Trigger External Ingestion Sweep
                    </button>
                    <a 
                      href={`${API_BASE}/publications/accreditation-export`}
                      target="_blank"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
                    >
                      Export NAAC/NIRF Proofs
                    </a>
                  </div>
                </div>

                {/* Publications Table */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm mb-3">Institutional Publication Repository ({publications.length} Papers)</h3>
                  <div className="overflow-x-auto custom-scrollbar max-h-[500px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b">
                        <tr>
                          <th className="py-2.5 px-3">Title & Authors</th>
                          <th className="py-2.5 px-3">Faculty Member</th>
                          <th className="py-2.5 px-3">Journal & ISSN</th>
                          <th className="py-2.5 px-3">Tier / Quartile</th>
                          <th className="py-2.5 px-3">Citations</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {publications.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 max-w-sm">
                              <div className="font-bold text-slate-900">{p.title}</div>
                              <div className="text-[10px] text-slate-500 truncate">{p.authors}</div>
                              {p.doi && <div className="text-[10px] text-blue-600 font-mono mt-0.5">DOI: {p.doi}</div>}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{p.faculty_name || "Doctoral Scholar"}</td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">{p.journal_name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">ISSN: {p.issn || "Online"}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.quartile === "Q1" ? "bg-emerald-100 text-emerald-800" : (p.quartile === "Q2" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800")
                              }`}>
                                {p.quartile}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{p.citations}</td>
                            <td className="py-2.5 px-3">
                              {p.is_flagged_predatory ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  FLAGGED: PREDATORY
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  VERIFIED
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* AGENT 18: JOURNAL QUARTILE VERIFIER */}
            {activeTab === "journal" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="max-w-xl">
                    <h2 className="font-bold text-slate-900 text-base">Agent 18: Journal Quartile & Predatory Risk Verifier</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify venue before manuscript submission. Checks Web of Science, Scopus, UGC-CARE, delisting flags, and calculates predatory risk index.
                    </p>
                    <div className="flex items-center space-x-2 mt-4">
                      <input 
                        type="text"
                        value={journalQuery}
                        onChange={(e) => setJournalQuery(e.target.value)}
                        placeholder="Enter ISSN (e.g. 2168-2267) or Title (e.g. Pattern Recognition)"
                        className="flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <button
                        onClick={() => verifyJournal(journalQuery)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                      >
                        Verify Venue
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => { setJournalQuery("2168-2267"); verifyJournal("2168-2267"); }} className="text-[11px] text-blue-600 underline">Sample Q1: IEEE Trans Cybernetics</button>
                      <button onClick={() => { setJournalQuery("1868-5137"); verifyJournal("1868-5137"); }} className="text-[11px] text-rose-600 underline">Sample Delisted: J Ambient Intelligence</button>
                    </div>
                  </div>
                </div>

                {/* Journal Verification Result Card */}
                {journalResult && (
                  <div className={`p-6 rounded-xl border shadow-sm ${
                    journalResult.verdict_badge === "REJECTED" ? "bg-rose-50/70 border-rose-200" : (journalResult.verdict_badge === "CAUTION" ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200")
                  }`}>
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-slate-900">{journalResult.title}</h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            ISSN: {journalResult.canonical_issn}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Publisher: <span className="font-semibold text-slate-800">{journalResult.publisher}</span> • Subject: {journalResult.subject_category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-black px-3 py-1 rounded inline-block ${
                          journalResult.verdict_badge === "REJECTED" ? "bg-rose-600 text-white" : (journalResult.verdict_badge === "CAUTION" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white")
                        }`}>
                          {journalResult.verdict}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">Checked on: {journalResult.verification_timestamp?.slice(0,10)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                      <div className="bg-white/80 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">JCR Quartile (WoS)</span>
                        <span className="text-xl font-black text-slate-900">{journalResult.quartiles?.jcr_wos || "N/A"}</span>
                      </div>
                      <div className="bg-white/80 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">CiteScore (Scopus)</span>
                        <span className="text-xl font-black text-slate-900">{journalResult.metrics?.citescore || "N/A"}</span>
                      </div>
                      <div className="bg-white/80 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">Impact Factor</span>
                        <span className="text-xl font-black text-slate-900">{journalResult.metrics?.impact_factor || "0.0"}</span>
                      </div>
                      <div className="bg-white/80 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">Peer Review Turnaround</span>
                        <span className="text-xl font-black text-slate-900">{journalResult.metrics?.peer_review_turnaround_weeks} Weeks</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-900 text-white rounded-lg text-xs">
                      <span className="font-bold text-blue-300 block mb-1">RECOMMENDATION VERDICT:</span>
                      {journalResult.recommendation}
                    </div>

                    {/* Risk evidence list if any */}
                    {journalResult.risk_evidence?.length > 0 && (
                      <div className="mt-4 p-3 bg-rose-100/70 border border-rose-300 rounded-lg text-xs text-rose-900">
                        <span className="font-bold block mb-1">🚨 PREDATORY / DELISTING EVIDENCE:</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {journalResult.risk_evidence.map((rev, i) => (
                            <li key={i}>{rev}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Alternative Journals suggestions */}
                    {journalResult.alternatives?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h4 className="font-bold text-xs text-slate-900 mb-2">Recommended Reputable Alternative Venues (Q1 / Q2 Tier)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {journalResult.alternatives.map(alt => (
                            <div key={alt.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                              <span className="font-bold text-slate-900 block truncate">{alt.title}</span>
                              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                                <span>ISSN: {alt.issn}</span>
                                <span className="font-bold text-blue-600">{alt.quartile} • IF {alt.impact_factor}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AGENT 20: RESEARCH PRODUCTIVITY & GINI */}
            {activeTab === "productivity" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Agent 20: Research Productivity & Gini Concentration Engine</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quality-weighted scores across quartiles (Q1: 15pts, Q2: 10pts), discipline normalization (CSE, ECE, Mech, S&H), and NIRF RPC computation.
                    </p>
                  </div>
                </div>

                {/* Gini Concentration Metrics */}
                {departmentBenchmarks && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs font-medium text-slate-500 uppercase">Institutional Gini Index</span>
                      <div className="text-2xl font-black text-blue-600 mt-1">{departmentBenchmarks.institutional_gini_coefficient}</div>
                      <p className="text-[11px] text-slate-600 mt-1">{departmentBenchmarks.concentration_insight}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs font-medium text-slate-500 uppercase">Top 10% Output Concentration</span>
                      <div className="text-2xl font-black text-indigo-600 mt-1">{departmentBenchmarks.top_10_percent_share_pct}%</div>
                      <p className="text-[11px] text-slate-600 mt-1">Portion of total research points produced by top 10% faculty</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-xs font-medium text-slate-500 uppercase">NIRF RPC Score Projection</span>
                      <div className="text-2xl font-black text-emerald-600 mt-1">68.4 / 100</div>
                      <p className="text-[11px] text-slate-600 mt-1">Accreditation component for Research and Professional Practice</p>
                    </div>
                  </div>
                )}

                {/* Departmental Benchmarks Table */}
                {departmentBenchmarks?.department_benchmarks && (
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-sm mb-3">Departmental Research Benchmarking</h3>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                          <tr>
                            <th className="py-2.5 px-3">Department</th>
                            <th className="py-2.5 px-3">Faculty Count</th>
                            <th className="py-2.5 px-3">Total Productivity Points</th>
                            <th className="py-2.5 px-3">Avg Points / Faculty</th>
                            <th className="py-2.5 px-3">Top Faculty Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {departmentBenchmarks.department_benchmarks.map((dept, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-bold text-slate-900">{dept.department}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-700">{dept.faculty_count}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{dept.total_productivity_score}</td>
                              <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{dept.average_productivity_per_faculty}</td>
                              <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{dept.peak_faculty_score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AGENT 59: FACULTY PERFORMANCE APPRAISAL */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Agent 59: Faculty Performance & Annual Appraisal Dossier</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Auto-populates Teaching (35%), Research (35%), Administration (15%), and Outreach (15%) from platform records with context adjustments.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsContesting(true)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition"
                  >
                    ⚖️ Contest Automated Calculation
                  </button>
                </div>

                {/* Dossier Card */}
                {dossier && (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-wrap justify-between items-start border-b pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-slate-900">{dossier.faculty_name}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                            {dossier.designation} • {dossier.department}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Appraisal Cycle: <span className="font-semibold text-slate-800">{dossier.academic_year}</span> • Status: <span className="font-bold text-blue-600">{dossier.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-blue-600">{dossier.aggregate_score} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
                          {dossier.performance_band}
                        </span>
                      </div>
                    </div>

                    {/* Dimension Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block">Teaching & Learning (35%)</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{dossier.dimension_scores.teaching.score}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{dossier.dimension_scores.teaching.teaching_hours} Hours/week instruction</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block">Research & Innovation (35%)</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{dossier.dimension_scores.research.score}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {dossier.dimension_scores.research.publications_count} Pubs ({dossier.dimension_scores.research.q1_q2_count} Q1/Q2) • {dossier.dimension_scores.research.phd_scholars_active} PhDs
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block">Administration (15%)</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{dossier.dimension_scores.governance.score}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Role: {dossier.dimension_scores.governance.role}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 block">Outreach & Mentorship (15%)</span>
                        <div className="text-2xl font-black text-slate-900 mt-1">{dossier.dimension_scores.outreach.score}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Reviews, FDPs & Keynotes</div>
                      </div>
                    </div>

                    {/* Context Normalization Note */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-center justify-between">
                      <span>Administrative Relief Multiplier: <strong>{dossier.administrative_adjustment_factor}x</strong> applied to recognize heavy leadership workload without penalizing research output.</span>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Traceable Audit Trail</span>
                    </div>

                    {/* Agreed Next Cycle Goals */}
                    <div className="border-t pt-4 text-xs">
                      <span className="font-bold text-slate-900 block mb-1">Agreed Performance Targets for Next Cycle:</span>
                      <p className="text-slate-600">{dossier.agreed_next_cycle_goals}</p>
                    </div>
                  </div>
                )}

                {/* Contestation Modal */}
                {isContesting && (
                  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                      <h3 className="font-bold text-base text-slate-900">Contest Automated Performance Calculation</h3>
                      <p className="text-xs text-slate-500">Submit formal contestation to the Dean of Research and IQAC committee with your justification.</p>
                      <textarea
                        rows="3"
                        value={contestReason}
                        onChange={(e) => setContestReason(e.target.value)}
                        placeholder="Explain reason for contestation (e.g. Uncounted Q1 journal published late in reporting cycle)..."
                        className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setIsContesting(false)}
                          className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleContest}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                        >
                          Submit Contestation
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AGENT 71: UNIVERSITY KPI COCKPIT */}
            {activeTab === "kpi" && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Agent 71: University Strategic Key Performance Indicator Cockpit</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live institutional radar tracking Research, Doctoral Studies, Faculty, Governance, and NIRF / NAAC Frameworks.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSyncKpis}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                    >
                      🔄 Live KPI Sync
                    </button>
                    <button
                      onClick={handleExportGovernanceBrief}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
                    >
                      📑 Export Governance Briefing
                    </button>
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kpis.map(kpi => {
                    const isAmber = kpi.status === "On_Target_Deteriorating";
                    const isGreen = kpi.status === "On_Target_Improving";
                    const isRed = kpi.status === "Off_Target_Deteriorating";

                    return (
                      <div 
                        key={kpi.id} 
                        className={`p-5 rounded-xl border shadow-sm ${
                          isAmber ? "bg-amber-50/60 border-amber-300" : (isRed ? "bg-rose-50/60 border-rose-300" : "bg-white border-slate-200")
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {kpi.code} • {kpi.domain}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            isAmber ? "bg-amber-200 text-amber-900" : (isGreen ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800")
                          }`}>
                            {kpi.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 mt-2">{kpi.title}</h4>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-2xl font-black text-slate-900">{kpi.current_value}</span>
                          <span className="text-xs text-slate-500 font-semibold">{kpi.unit}</span>
                          <span className="text-xs text-slate-400">/ Target: {kpi.target_value}</span>
                        </div>

                        {/* Early Warning Banner for On_Target_Deteriorating */}
                        {isAmber && (
                          <div className="mt-3 p-2 bg-amber-100/90 text-amber-900 rounded text-[11px] font-medium border border-amber-300">
                            ⚠️ <strong>EARLY WARNING:</strong> Meeting target but declining from prior period ({kpi.prior_period_value}).
                          </div>
                        )}

                        <div className="text-[11px] text-slate-500 mt-3 border-t pt-2 space-y-0.5">
                          <div>Framework: <span className="font-medium text-slate-800">{kpi.nirf_mapping}</span></div>
                          <div>Owner: <span className="font-medium text-slate-800">{kpi.owner_role}</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lead / Lag Analysis Section */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Institutional Lead-Lag Predictive Relationships</h3>
                  <p className="text-xs text-slate-500 mb-4">Understands cause-and-effect lags between operational inputs and downstream university ranking outputs.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {leadLag.map((rel, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-700 font-mono">Lag Time: {rel.time_lag}</span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">{rel.correlation_strength}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Leading Input Indicator</span>
                          <span className="font-semibold text-slate-900">{rel.lead_indicator}</span>
                        </div>
                        <div className="text-center text-slate-400 font-bold">↓ DIRECT IMPACT ↓</div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Lagging Outcome Indicator</span>
                          <span className="font-semibold text-slate-900">{rel.lag_indicator}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1">
                          {rel.strategic_insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generated Governance Briefing Preview */}
                {governanceBrief && (
                  <div className="bg-brand-900 text-white p-6 rounded-xl border border-slate-700 shadow-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                      <div>
                        <h3 className="font-black text-base text-white">{governanceBrief.report_title}</h3>
                        <p className="text-xs text-blue-300">{governanceBrief.institution}</p>
                      </div>
                      <span className="text-xs font-mono bg-blue-800/60 px-3 py-1 rounded border border-blue-600">
                        NIRF Trajectory: {governanceBrief.nirf_score_projection?.projected_rank_band}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        <span className="text-slate-400 block">Monitored Indicators</span>
                        <span className="text-xl font-bold text-white mt-1 block">{governanceBrief.total_kpis_monitored}</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        <span className="text-slate-400 block">Target Compliance</span>
                        <span className="text-xl font-bold text-emerald-400 mt-1 block">{governanceBrief.on_target_pct}%</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        <span className="text-slate-400 block">Projected Overall Score</span>
                        <span className="text-xl font-bold text-blue-400 mt-1 block">{governanceBrief.nirf_score_projection?.projected_overall_score}</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        <span className="text-slate-400 block">RPC Component Score</span>
                        <span className="text-xl font-bold text-purple-400 mt-1 block">{governanceBrief.nirf_score_projection?.rpc_component_score}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Institutional Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div>
                © {new Date().getFullYear()} Vignan's Foundation for Science, Technology & Research (VFSTR). Deemed to be University.
              </div>
              <div className="flex space-x-4 text-[11px] text-slate-400">
                <span>FastAPI 0.141 Backend</span>
                <span>•</span>
                <span>PostgreSQL Schema Ready</span>
                <span>•</span>
                <span>React 18 / Tailwind CSS</span>
              </div>
            </div>
          </footer>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById("root")).render(<App />);