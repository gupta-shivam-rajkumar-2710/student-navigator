"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { getInstituteSummary, iitPlacementInstitutes } from "./data";

const pct = value => value == null ? "Not Available" : `${value.toFixed(2)}%`;
const money = value => value == null ? "Not Available" : `₹${Number(value).toFixed(2)} LPA`;
const statusText = status => status === "pending_official_verification" ? "Pending Official Verification" : status === "verified" ? "Verified" : status === "rejected" ? "Rejected" : "Unverified · Community source";
const isMixedBasis = institute => String(institute.sourceType || "").includes("mixed_package_basis");

function Chart({ title, description, entries, unit = "LPA", color = "blue", maxValue }) {
  const max = maxValue || Math.max(1, ...entries.map(item => item.value || 0));
  return <article className="iit-data-chart">
    <div className="iit-data-chart-heading"><div><h3>{title}</h3><p>{description}</p></div><span>{unit}</span></div>
    {entries.length ? <div className="iit-data-bars" role="list" aria-label={title}>{entries.map((entry, index) => <div className="iit-data-bar-row" key={`${entry.label}-${index}`} role="listitem"><span title={entry.label}>{entry.label}</span><div className="iit-data-bar-track"><i className={`iit-data-bar ${color}`} style={{ width: `${Math.max(1, entry.value / max * 100)}%` }}/></div><b>{entry.value.toFixed(2)}{unit === "%" ? "%" : ""}</b></div>)}</div> : <p className="iit-chart-empty">No numeric data available for this selection.</p>}
  </article>;
}

function branchFamily(branch) {
  const code = branch.code.toUpperCase();
  const name = branch.name.toLowerCase();
  if (["CSE", "CS"].includes(code) || name.includes("computer science")) return "Computer Science";
  if (["EE", "EEE"].includes(code) || name.includes("electrical engineering")) return "Electrical Engineering";
  if (["ME"].includes(code) || name.includes("mechanical engineering")) return "Mechanical Engineering";
  if (["CE", "CIE", "CL"].includes(code) || name.includes("civil engineering")) return "Civil Engineering";
  if (["CH", "CHE"].includes(code) || name.includes("chemical engineering")) return "Chemical Engineering";
  if (["EP"].includes(code) || name.includes("engineering physics")) return "Engineering Physics";
  if (["MNC"].includes(code) || name.includes("mathematics and computing")) return "Mathematics and Computing";
  return null;
}

export default function IITPlacementsPage() {
  const [institutes, setInstitutes] = useState(iitPlacementInstitutes);
  const [databaseState, setDatabaseState] = useState("local_seed");
  const [selectedSlug, setSelectedSlug] = useState(iitPlacementInstitutes[0].slug);
  const [selectedYear, setSelectedYear] = useState(iitPlacementInstitutes[0].academicYear);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("averageCtc");
  const [sortDirection, setSortDirection] = useState("desc");
  const [chartMetric, setChartMetric] = useState("averageCtc");
  const [showTotalCompensation, setShowTotalCompensation] = useState(false);
  const [compareSlugs, setCompareSlugs] = useState(["iit-madras", "iit-hyderabad"]);
  const [compareFamily, setCompareFamily] = useState("Computer Science");
  const [compareMetric, setCompareMetric] = useState("averageCtc");
  useEffect(() => {
    let alive = true;
    fetch("/api/colleges/iit-placements", { cache: "no-store" }).then(async response => {
      const payload = await response.json();
      if (!response.ok || !payload.institutes?.length) throw new Error(payload.error || "No database records");
      if (!alive) return;
      const fromDatabase = new Map(payload.institutes.map(item => [item.slug, item]));
      setInstitutes(iitPlacementInstitutes.map(seed => fromDatabase.get(seed.slug) || seed));
      setDatabaseState(payload.institutes.length === iitPlacementInstitutes.length ? "supabase" : "partial_database");
    }).catch(() => { if (alive) setDatabaseState("local_seed"); });
    return () => { alive = false; };
  }, []);
  const selectedInstitute = institutes.find(item => item.slug === selectedSlug) || institutes[0];
  const yearReports = selectedInstitute.reports?.length ? selectedInstitute.reports : [selectedInstitute];
  const selectedYearAvailable = yearReports.some(report => report.academicYear === selectedYear);
  const activeYear = selectedYearAvailable ? selectedYear : yearReports[0].academicYear;
  const selectedReport = yearReports.find(report => report.academicYear === activeYear) || yearReports[0];
  const institute = { ...selectedInstitute, ...selectedReport, academicYear: selectedReport.academicYear || selectedInstitute.academicYear };
  const summary = useMemo(() => getInstituteSummary(institute), [institute]);
  const branches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return institute.branches.filter(branch => !query || `${branch.code} ${branch.name} ${branch.degree}`.toLowerCase().includes(query)).sort((a, b) => {
      const left = a[sortBy], right = b[sortBy];
      if (left == null && right == null) return a.name.localeCompare(b.name);
      if (left == null) return 1;
      if (right == null) return -1;
      const result = Number(left) - Number(right);
      return sortDirection === "asc" ? result : -result;
    });
  }, [institute, search, sortBy, sortDirection]);

  const hasTc = institute.branches.some(branch => branch.averageTc != null || branch.medianTc != null || branch.minimumTc != null || branch.maximumTc != null);
  const currentChartEntries = useMemo(() => institute.branches.filter(branch => branch[chartMetric] != null).map(branch => ({ label: branch.code, value: Number(branch[chartMetric]) })).sort((a, b) => b.value - a.value), [institute, chartMetric]);
  const compareInstitutes = institutes.filter(item => compareSlugs.includes(item.slug)).map(item => {
    const yearReport = (item.reports || [item]).find(report => report.academicYear === activeYear);
    return yearReport ? { ...item, ...yearReport, academicYear: yearReport.academicYear } : null;
  }).filter(Boolean);
  const compareBranchEntries = compareInstitutes.map(item => {
    if (isMixedBasis(item)) return null;
    const matched = item.branches.find(branch => branchFamily(branch) === compareFamily && branch[compareMetric] != null);
    return matched ? { label: `${item.shortName} · ${matched.code}`, value: Number(matched[compareMetric]) } : null;
  }).filter(Boolean);
  const instituteAverageEntries = compareInstitutes.map(item => {
    const result = getInstituteSummary(item);
    if (result.weightedAverageCtc != null) return { label: item.shortName, value: result.weightedAverageCtc, note: "Weighted from placed-student counts" };
    if (item.reportedAverageCtc != null) return { label: item.shortName, value: item.reportedAverageCtc, note: "Separately reported overall figure" };
    return null;
  }).filter(Boolean);

  function changeSort(field) {
    if (field === sortBy) setSortDirection(current => current === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDirection("desc"); }
  }
  function toggleCompare(slug) {
    setCompareSlugs(current => current.includes(slug) ? current.filter(item => item !== slug) : current.length < 4 ? [...current, slug] : current);
  }

  return <main className="iit-data-page">
    <Navigation/>
    <section className="iit-data-hero"><div className="iit-data-orb"/><div className="iit-data-hero-inner"><span className="eyebrow accent">STUDENT NAVIGATOR · IIT PLACEMENT DATA</span><h1>Compare placements<br/><span>branch by branch.</span></h1><p>Explore source-labelled placement data across seven IITs. Compare the same academic year and equivalent programs where records allow.</p><div className="iit-data-hero-meta"><span>7 IITs</span><span>·</span><span>2025–26 / 2026 cohort</span><span>·</span><span>Community supplied data marked unverified</span><span>·</span><span>{databaseState === "supabase" ? "Supabase connected" : databaseState === "partial_database" ? "Supabase partially populated · local seeds fill gaps" : "Showing local seed data · Supabase not connected"}</span></div></div></section>

    <div className="iit-data-content">
      <section className="iit-selector-card"><div><span className="eyebrow accent">CHOOSE AN INSTITUTE</span><h2>Placement report explorer</h2><p>Branch figures remain attached to their report year and source.</p></div><div className="iit-selector-fields"><label>Institute<select value={selectedSlug} onChange={event => { const chosen = institutes.find(item => item.slug === event.target.value); setSelectedSlug(event.target.value); setSelectedYear(chosen?.reports?.[0]?.academicYear || chosen?.academicYear || ""); setSearch(""); setChartMetric("averageCtc"); setShowTotalCompensation(false); }} aria-label="Select IIT">{institutes.map(item => <option key={item.slug} value={item.slug}>{item.shortName}</option>)}</select></label><label>Academic year<select value={activeYear} onChange={event => { setSelectedYear(event.target.value); setChartMetric("averageCtc"); setShowTotalCompensation(false); }} aria-label="Filter by academic year">{yearReports.map(report => <option key={report.academicYear} value={report.academicYear}>{report.academicYear}</option>)}</select></label></div></section>

      <section className="iit-selected-heading"><div><div className="iit-data-breadcrumb"><a href="/">Home</a><span>/</span><b>IIT placements</b></div><span className="eyebrow accent">{institute.academicYear} · {institute.academicYear === selectedInstitute.academicYear ? institute.reportedBatch || "B.Tech report" : "B.Tech report"}</span><h2>{institute.shortName}</h2><p>{institute.name} · {institute.city}, {institute.state}</p></div><div className="iit-source-status"><span className="iit-status-pill">{statusText(institute.verificationStatus)}</span>{institute.sourceUrl ? <a href={institute.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a> : <span>No source URL reported</span>}</div></section>

      <section className="iit-summary-cards">
        <article><span>Branches / courses listed</span><strong>{summary.totalBranches}</strong><small>{summary.availableAverageBranches} with an average value</small></article>
        <article><span>Weighted average CTC · B.Tech</span><strong>{money(summary.weightedAverageCtc)}</strong><small>{summary.weightedAverageCtc == null ? "Counts unavailable; no aggregate calculated" : "Calculated from branch averages weighted by students placed"}</small></article>
        <article><span>Registered / placed · B.Tech</span><strong>{summary.registeredStudents == null ? "Not Available" : `${summary.registeredStudents} / ${summary.placedStudents}`}</strong><small>{summary.registeredStudents == null ? "Student counts not in supplied source" : `Overall placement ${pct(summary.overallPlacementPercentage)} · calculated`}</small></article>
        <article><span>{isMixedBasis(institute) ? "Highest listed average" : "Highest branch average"}</span><strong>{summary.highestBranchAverage ? money(summary.highestBranchAverage.averageCtc) : "Not Available"}</strong><small>{summary.highestBranchAverage?.code || "No reported branch averages"}</small></article>
        <article><span>{isMixedBasis(institute) ? "Lowest listed average" : "Lowest branch average"}</span><strong>{summary.lowestBranchAverage ? money(summary.lowestBranchAverage.averageCtc) : "Not Available"}</strong><small>{summary.lowestBranchAverage?.code || "No reported branch averages"}</small></article>
        <article><span>Institute median CTC</span><strong>Not Available</strong><small>Not derived from branch medians</small></article>
      </section>

      {institute.reportedAverageCtc != null && <aside className="iit-reported-average"><span><b>{institute.reportedAverageLabel}:</b> {money(institute.reportedAverageCtc)}</span><small>Displayed separately from calculated branch averages. The source does not provide student counts to derive a weighted mean.</small></aside>}

      <section className="iit-data-panel"><div className="iit-panel-title"><div><span className="eyebrow accent">BRANCH OUTCOMES</span><h2>Placement statistics</h2><p>{isMixedBasis(institute) ? "Salary figures in ₹ LPA as reported; the source says package basis varies across rows." : "CTC values in ₹ LPA. Missing entries remain unavailable."}</p></div><div className="iit-table-tools"><label>Search branches<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Branch name or code"/></label>{hasTc && <button className="iit-tc-toggle" onClick={() => setShowTotalCompensation(value => !value)}>{showTotalCompensation ? "Hide first-year TC" : "Show first-year TC"}</button>}</div></div>
        <div className="iit-table-wrap"><table className="iit-full-table"><thead><tr><th>Rank</th><th>Branch / course</th><th>Degree</th><th><button onClick={() => changeSort("averageCtc")}>{isMixedBasis(institute) ? "Average as reported" : "Average CTC"} {sortBy === "averageCtc" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</button></th><th><button onClick={() => changeSort("medianCtc")}>{isMixedBasis(institute) ? "Median as reported" : "Median CTC"} {sortBy === "medianCtc" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</button></th>{showTotalCompensation && hasTc && <><th>Average TC · 1 year</th><th>Median TC · 1 year</th><th>Minimum TC</th><th>Maximum TC</th></>}<th>{isMixedBasis(institute) ? "Min reported" : "Min CTC"}</th><th>{isMixedBasis(institute) ? "Max reported" : "Max / highest CTC"}</th><th>Registered</th><th>Placed</th><th><button onClick={() => changeSort("placementPercentage")}>Placement % {sortBy === "placementPercentage" ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}</button></th></tr></thead><tbody>{branches.map((branch, index) => <tr key={`${branch.code}-${branch.degree}`}><td>{index + 1}</td><td><b>{branch.name}</b><small>{branch.code}</small></td><td>{branch.degree}</td><td>{money(branch.averageCtc)}</td><td>{money(branch.medianCtc)}</td>{showTotalCompensation && hasTc && <><td>{money(branch.averageTc)}</td><td>{money(branch.medianTc)}</td><td>{money(branch.minimumTc)}</td><td>{money(branch.maximumTc)}</td></>}<td>{money(branch.minimumCtc)}</td><td>{money(branch.highestPackage)}</td><td>{branch.registeredStudents ?? "Not Available"}</td><td>{branch.placedStudents ?? "Not Available"}</td><td>{pct(branch.placementPercentage)}</td></tr>)}{!branches.length && <tr><td colSpan={showTotalCompensation && hasTc ? "14" : "10"} className="iit-no-data">No branches match this search.</td></tr>}</tbody></table></div>
        <p className="iit-table-note">The IIT Kharagpur source warns its package values may mix CTC, first-year total compensation, and base salary. Other records are unverified community-shared screenshots unless their source status says otherwise. Total compensation and CTC have not been combined.</p>
      </section>

      <section className="iit-charts-grid"><div className="iit-data-panel iit-metric-chart"><div className="iit-panel-title"><div><span className="eyebrow accent">INSTITUTE BRANCH VIEW</span><h2>Branch comparison</h2></div><label>Metric<select value={chartMetric} onChange={event => setChartMetric(event.target.value)}><option value="averageCtc">Average CTC / reported average</option><option value="medianCtc">Median CTC / reported median</option>{hasTc && <><option value="averageTc">Average TC · 1 year</option><option value="medianTc">Median TC · 1 year</option></>}<option value="placementPercentage">Placement percentage</option></select></label></div><Chart title={chartMetric === "averageCtc" ? isMixedBasis(institute) ? "Average package as reported" : "Average CTC by branch" : chartMetric === "medianCtc" ? isMixedBasis(institute) ? "Median package as reported" : "Median CTC by branch" : chartMetric === "averageTc" ? "Average total compensation · first year" : chartMetric === "medianTc" ? "Median total compensation · first year" : "Placement percentage by branch"} description={`Available values · ${institute.shortName} · ${institute.academicYear}${isMixedBasis(institute) ? " · mixed salary basis noted by source" : ""}`} entries={currentChartEntries} unit={chartMetric === "placementPercentage" ? "%" : "LPA"} color={chartMetric === "placementPercentage" ? "green" : chartMetric.endsWith("Tc") ? "violet" : "blue"}/></div>
        <div className="iit-data-panel iit-compare-panel"><div className="iit-panel-title"><div><span className="eyebrow accent">COMPARE UP TO FOUR</span><h2>IIT comparison</h2><p>Institute-level averages are shown only when directly reported or weighted from counts.</p></div></div><div className="iit-compare-picks">{institutes.map(item => <label key={item.slug}><input type="checkbox" checked={compareSlugs.includes(item.slug)} onChange={() => toggleCompare(item.slug)} disabled={!compareSlugs.includes(item.slug) && compareSlugs.length >= 4}/>{item.shortName}</label>)}</div><label className="iit-family-select">Equivalent branch<select value={compareFamily} onChange={event => setCompareFamily(event.target.value)}>{["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Engineering Physics", "Mathematics and Computing"].map(item => <option key={item}>{item}</option>)}</select></label><Chart title="Institute-average CTC" description="Weighted calculation where placed counts exist; reported overall values remain labelled separately." entries={instituteAverageEntries} color="violet"/><label className="iit-family-select iit-compare-metric-select">Branch metric<select value={compareMetric} onChange={event => setCompareMetric(event.target.value)}><option value="averageCtc">Average CTC</option><option value="medianCtc">Median CTC</option><><option value="averageTc">Average TC · 1 year</option><option value="medianTc">Median TC · 1 year</option></><option value="placementPercentage">Placement percentage</option><option value="highestPackage">Highest branch CTC</option></select></label><Chart title={`${compareFamily} · ${compareMetric === "placementPercentage" ? "placement percentage" : compareMetric === "medianCtc" ? "median CTC" : compareMetric === "averageTc" ? "average TC · first year" : compareMetric === "medianTc" ? "median TC · first year" : compareMetric === "highestPackage" ? "highest branch CTC" : "average CTC"}`} description="Only matched equivalent program families with available values in the same academic year. Kharagpur's mixed-basis figures are excluded." entries={compareBranchEntries} unit={compareMetric === "placementPercentage" ? "%" : "LPA"} color={compareMetric.endsWith("Tc") ? "violet" : "green"}/><div className="iit-compare-metrics">{compareInstitutes.map(item => { const result = getInstituteSummary(item); return <article key={item.slug}><b>{item.shortName}</b><span>Weighted average: {money(result.weightedAverageCtc)}</span><span>Placement: {pct(result.overallPlacementPercentage)}</span><span>Highest reported branch CTC: {money(result.highestBranchPackage)}</span><span>Institute median: Not Available</span><small>{result.weightedAverageCtc == null ? item.reportedAverageCtc == null ? "No institute-wide average can be calculated from supplied data." : `Reported value ${money(item.reportedAverageCtc)} shown separately.` : "Weighted average calculated from branch placed-student counts."}</small></article>; })}</div></div></section>

      <section className="iit-transparency"><div><span className="eyebrow accent">DATA TRANSPARENCY</span><h2>Every figure keeps its context.</h2><p>These source posts include community-shared reports and an RTI-described dataset. None of the included Reddit screenshots has been independently confirmed against an official institute publication. Values are preserved as shown, missing values stay null, and derived percentages or weighted averages are labelled as calculations.</p></div><div className="iit-transparency-grid"><span>Verification status<b>{statusText(institute.verificationStatus)}</b></span><span>Source type<b>{String(institute.sourceType || "unknown").replaceAll("_", " ")}</b></span><span>Source URL{institute.sourceUrl ? <a href={institute.sourceUrl} target="_blank" rel="noreferrer">Open source post ↗</a> : <b>Not supplied</b>}</span><span>Institute median<b>Not computed from branch medians</b></span><span>Unweighted means<b>Not used as institute-wide averages</b></span><span>CTC / TC<b>Kept separate where the source distinguishes them</b></span></div></section>
    </div>
    <footer className="iit-data-footer"><a href="/">Student Navigator</a><span>Navigate your future with context.</span><a href="/admin/login">Admin login</a></footer>
  </main>;
}
