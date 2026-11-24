"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "../../components/Navigation";
import BranchCharts from "./BranchCharts";
import { getIitMadrasSummary, IIT_MADRAS_SOURCE, IIT_MADRAS_VERIFICATION, IIT_MADRAS_YEAR, iitMadrasBtechRows } from "./data";

const seedReport = {
  id: "local-seed-2025-26",
  academic_year: IIT_MADRAS_YEAR,
  degree: "B.Tech",
  source_url: IIT_MADRAS_SOURCE,
  verification_status: IIT_MADRAS_VERIFICATION,
  branch_placements: iitMadrasBtechRows.map(row => ({ department_code: row.departmentCode, average_package_lpa: row.averageCtc, median_package_lpa: row.medianCtc, verification_status: IIT_MADRAS_VERIFICATION })),
};
const formatLpa = value => value == null ? "Not Available" : `₹${Number(value).toFixed(1)} LPA`;
const statusLabel = status => status === "pending_official_verification" ? "Pending Official Verification" : status === "verified" ? "Verified" : status === "rejected" ? "Rejected" : "Unverified";

function reportRows(report) {
  return (report?.branch_placements || []).map(row => ({
    id: row.id,
    departmentCode: row.department_code || row.branch_name,
    averageCtc: row.average_package_lpa == null ? null : Number(row.average_package_lpa),
    medianCtc: row.median_package_lpa == null ? null : Number(row.median_package_lpa),
    verificationStatus: row.verification_status,
  }));
}

export default function IitMadrasProfile() {
  const [reports, setReports] = useState([seedReport]);
  const [year, setYear] = useState(IIT_MADRAS_YEAR);
  const [sortBy, setSortBy] = useState("departmentCode");
  const [sortDirection, setSortDirection] = useState("asc");
  const [databaseState, setDatabaseState] = useState("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/colleges/iit-madras", { cache: "no-store" }).then(async response => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Database unavailable");
      if (!active || !payload.reports?.length) return;
      setReports(payload.reports);
      setYear(current => payload.reports.some(report => report.academic_year === current) ? current : payload.reports[0].academic_year);
      setDatabaseState("connected");
    }).catch(() => { if (active) setDatabaseState("seed"); });
    return () => { active = false; };
  }, []);

  const activeReport = reports.find(report => report.academic_year === year) || reports[0];
  const rows = useMemo(() => reportRows(activeReport), [activeReport]);
  const summary = useMemo(() => getIitMadrasSummary(rows), [rows]);
  const sortedRows = useMemo(() => [...rows].sort((a, b) => {
    const av = a[sortBy], bv = b[sortBy];
    if (av == null && bv == null) return a.departmentCode.localeCompare(b.departmentCode);
    if (av == null) return 1;
    if (bv == null) return -1;
    const comparison = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
    return comparison * (sortDirection === "asc" ? 1 : -1);
  }), [rows, sortBy, sortDirection]);
  const sort = field => { if (sortBy === field) setSortDirection(value => value === "asc" ? "desc" : "asc"); else { setSortBy(field); setSortDirection("desc"); } };

  return <main className="iitm-profile-page">
    <Navigation/>
    <section className="iitm-profile-hero"><div className="hero-grid"/><div className="iitm-profile-hero-inner"><div className="iitm-seal" aria-label="IIT Madras wordmark">IIT<span>M</span></div><div className="iitm-profile-intro"><div className="iitm-crumb"><a href="/">Home</a><span>/</span><a href="/#college-directory">Colleges</a><span>/</span><b>IIT Madras</b></div><span className="eyebrow accent">INDIAN INSTITUTE OF TECHNOLOGY</span><h1>Indian Institute of<br/><span>Technology Madras.</span></h1><p>Chennai, Tamil Nadu, India <span>·</span> Government <span>·</span> IIT</p><div className="iitm-tags"><span>Placement report · B.Tech</span><span className="pending-pill">{statusLabel(activeReport?.verification_status || IIT_MADRAS_VERIFICATION)}</span></div></div></div></section>

    <div className="iitm-profile-content">
      <section className="iitm-overview-grid"><article className="iitm-overview-card"><span className="eyebrow accent">COLLEGE OVERVIEW</span><h2>Engineering, research, and opportunity in Chennai.</h2><p>Indian Institute of Technology Madras is a Government institute in Chennai, Tamil Nadu. This page presents B.Tech branch CTC figures for the academic year shown below. Branch data is not an institute-wide salary average.</p><div className="iitm-facts"><span>Institution category<b>IIT</b></span><span>College type<b>Government</b></span><span>Location<b>Chennai, Tamil Nadu</b></span><span>Degree<b>B.Tech</b></span></div></article><aside className="iitm-year-card"><label htmlFor="iitm-year">Academic year</label><select id="iitm-year" value={year} onChange={event => setYear(event.target.value)}>{reports.map(report => <option key={report.id} value={report.academic_year}>{report.academic_year} · {report.degree || "B.Tech"}</option>)}</select><div className="iitm-currency"><span>Currency</span><b>INR · LPA</b></div><span className={`database-status ${databaseState === "connected" ? "database-live" : ""}`}>{databaseState === "connected" ? "Live database record" : databaseState === "loading" ? "Loading report" : "Showing supplied report data"}</span></aside></section>

      <section className="iitm-summary-section"><div className="iitm-section-heading"><div><span className="eyebrow accent">PLACEMENT SUMMARY · {year}</span><h2>Branch outcomes at a glance</h2><p>These figures describe the available branches only. They are not institute-wide statistics.</p></div><a className="source-link" href={activeReport?.source_url || IIT_MADRAS_SOURCE} target="_blank" rel="noreferrer">View source ↗</a></div><div className="iitm-summary-grid"><article className="iitm-stat"><span>Branches with available data</span><strong>{summary.availableBranches}<small> / {summary.totalBranches}</small></strong><em>Branch records with CTC figures</em></article><article className="iitm-stat mean-stat"><span>Unweighted Mean of Available Branch Averages</span><strong>{summary.unweightedMeanBranchAverage == null ? "Not Available" : `₹${summary.unweightedMeanBranchAverage.toFixed(2)} LPA`}</strong><em>Unweighted mean · not the institute-wide average</em></article><article className="iitm-stat highest-stat"><span>Highest branch average</span><strong>{summary.highestAverage ? `₹${summary.highestAverage.averageCtc.toFixed(1)} LPA` : "Not Available"}</strong><em>{summary.highestAverage ? `${summary.highestAverage.departmentCode} department` : "No branch data available"}</em></article><article className="iitm-stat median-stat"><span>Highest branch median</span><strong>{summary.highestMedian ? `₹${summary.highestMedian.medianCtc.toFixed(1)} LPA` : "Not Available"}</strong><em>{summary.highestMedian ? `${summary.highestMedian.departmentCode} department` : "No branch data available"}</em></article></div></section>

      <section className="iitm-chart-section"><BranchCharts rows={rows}/></section>

      <section className="iitm-table-section"><div className="iitm-section-heading"><div><span className="eyebrow accent">B.TECH DEPARTMENT BREAKDOWN</span><h2>Branch-wise placement table</h2><p>M = median CTC · A = average CTC. Values are ₹ LPA as supplied.</p></div><span className="iitm-table-count">{rows.length} departments</span></div><div className="iitm-table-wrap"><table className="iitm-table"><thead><tr><th>Department</th><th><button onClick={() => sort("averageCtc")}>Average CTC {sortBy === "averageCtc" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</button></th><th><button onClick={() => sort("medianCtc")}>Median CTC {sortBy === "medianCtc" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</button></th><th>Record status</th></tr></thead><tbody>{sortedRows.map(row => <tr key={row.departmentCode} className={`${row.departmentCode === summary.highestAverage?.departmentCode ? "highest-average-row" : ""} ${row.departmentCode === summary.highestMedian?.departmentCode ? "highest-median-row" : ""}`}><td><b>{row.departmentCode}</b>{row.departmentCode === summary.highestAverage?.departmentCode && <span className="highest-badge">Top average</span>}{row.departmentCode === summary.highestMedian?.departmentCode && <span className="median-dot" title="Highest median">●</span>}</td><td className={row.departmentCode === summary.highestAverage?.departmentCode ? "highest-average-value" : ""}>{formatLpa(row.averageCtc)}</td><td>{formatLpa(row.medianCtc)}</td><td><span className="table-status">{statusLabel(row.verificationStatus || activeReport?.verification_status)}</span></td></tr>)}</tbody></table></div><p className="iitm-null-note">Unavailable source values are stored as NULL and displayed as “Not Available”; they are excluded from charts and calculations.</p></section>

      <section className="iitm-source-card"><div><span className="eyebrow accent">DATA SOURCE & VERIFICATION</span><h2>Pending official verification</h2><p>The department figures were supplied from the CTC Summary screenshot linked below. They have not been independently verified against an official IIT Madras report. Median and average CTC are stored and displayed separately.</p></div><div className="iitm-source-meta"><span>Academic year<b>{year}</b></span><span>Degree<b>{activeReport?.degree || "B.Tech"}</b></span><span>Last updated<b>{activeReport?.updated_at ? new Date(activeReport.updated_at).toLocaleDateString("en-IN") : "Not reported"}</b></span><a href={activeReport?.source_url || IIT_MADRAS_SOURCE} target="_blank" rel="noreferrer">Reddit source post ↗</a></div></section>

      <div className="iitm-admin-cta"><span><b>Manage this placement report</b><small>Authorized administrators can edit branches, source, year, and verification status.</small></span><a className="button-quiet" href="/admin/placements">Open admin dashboard →</a></div>
    </div>
    <footer className="footer iitm-footer"><a className="brand" href="/"><span className="brand-mark">◉</span><span>student<span className="brand-light">navigator</span></span></a><span className="footer-tag">Navigate Your Future. Compare Your Opportunities.</span><div className="footer-links"><a href="/#college-directory">Colleges</a><a href="/roi-calculator">ROI Calculator</a><a href="/">Home</a></div><span className="copyright">© 2025 Student Navigator</span></footer>
  </main>;
}
