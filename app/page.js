"use client";

import { useEffect, useMemo, useState } from "react";
import { placementColleges, placementDisplay, placementRows } from "./placement-data";
import Navigation from "./components/Navigation";

const colleges = [
  { name: "Indian Institute of Technology Bombay", short: "IIT Bombay", city: "Mumbai", state: "Maharashtra", type: "Government", initials: "IB", tint: "blue", branches: "Computer Science · Electrical · Mechanical", note: "Placement report coming soon" },
  { name: "Indian Institute of Technology Delhi", short: "IIT Delhi", city: "New Delhi", state: "Delhi", type: "Government", initials: "ID", tint: "violet", branches: "Computer Science · Electrical · Civil", note: "Placement report coming soon" },
  { name: "Indian Institute of Technology Madras", short: "IIT Madras", city: "Chennai", state: "Tamil Nadu", type: "Government", initials: "IM", tint: "orange", branches: "Computer Science · Aerospace · Electrical", note: "Placement report coming soon" },
  { name: "National Institute of Technology Tiruchirappalli", short: "NIT Trichy", city: "Tiruchirappalli", state: "Tamil Nadu", type: "Government", initials: "NT", tint: "cyan", branches: "Computer Science · ECE · Mechanical", note: "Placement report coming soon" },
  { name: "RV College of Engineering", short: "RVCE", city: "Bengaluru", state: "Karnataka", type: "Private", initials: "RV", tint: "green", branches: "Computer Science · ISE · AI & ML", note: "Placement report coming soon" },
  { name: "BITS Pilani", short: "BITS Pilani", city: "Pilani", state: "Rajasthan", type: "Private", initials: "BP", tint: "gold", branches: "Computer Science · ECE · Mathematics", note: "Placement report coming soon" },
  { name: "International Institute of Information Technology", short: "IIIT Hyderabad", city: "Hyderabad", state: "Telangana", type: "Private", initials: "IH", tint: "pink", branches: "Computer Science · ECE · AI & ML", note: "Placement report coming soon" },
  { name: "BMS College of Engineering", short: "BMSCE", city: "Bengaluru", state: "Karnataka", type: "Private", initials: "BM", tint: "blue", branches: "Computer Science · ISE · ECE", note: "Placement report coming soon" },
];

const fullCollegeList = [
  ...placementColleges.map(item => {
    const existing = colleges.find(c => c.short.toLowerCase() === item.name.toLowerCase());
    const onlyValue = field => {
      const values = [...new Set(item.rows.map(row => row[field]))];
      return values.length === 1 ? values[0] : null;
    };
    return {
      ...existing,
      name: existing?.name || item.name,
      short: existing?.short || item.name,
      city: existing?.city || "Not Reported",
      state: existing?.state || "Not Reported",
      type: existing?.type || (item.instituteType === "IIIT" ? "Institute type not specified" : "Government"),
      instituteType: item.instituteType,
      initials: existing?.initials || item.name.split(/\s+/).slice(0, 2).map(part => part[0]).join(""),
      tint: existing?.tint || "blue",
      branches: existing?.branches || "Not Reported",
      rows: item.rows,
      placementPct: onlyValue("placementPct"),
      highestPackage: placementDisplay(item, "highestPackage"),
      averagePackage: placementDisplay(item, "averagePackage"),
      medianPackage: "Not Reported",
      annualFees: "Not Reported",
      placementYear: "Not Reported",
      highestLpa: onlyValue("highestLpa"),
      averageLpa: onlyValue("averageLpa"),
      placementConflict: new Set(item.rows.map(row => row.placementPct)).size > 1,
    };
  }),
  ...colleges.filter(c => !placementColleges.some(item => item.name.toLowerCase() === c.short.toLowerCase())).map(c => ({ ...c, instituteType: "Other", rows: [], placementPct: null, highestPackage: "Not Reported", averagePackage: "Not Reported", medianPackage: "Not Reported", annualFees: "Not Reported", placementYear: "Not Reported", highestLpa: null, averageLpa: null })),
];

const topColleges = [...fullCollegeList].filter(c => c.rows.length && !c.placementConflict && c.placementPct != null).sort((a, b) => b.placementPct - a.placementPct).slice(0, 3);
const branchSuggestions = [...new Set(fullCollegeList.flatMap(c => c.branches.split(" · ")).filter(branch => branch !== "Not Reported"))];

const Icon = ({ name, size = 18 }) => {
  const paths = { search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, arrow: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>, pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>, bookmark: <path d="M6 4h12v17l-6-4-6 4z"/>, compare: <><path d="M8 3v18M16 3v18M3 8h10M11 16h10"/></>, check: <path d="m5 12 4 4L19 6"/>, compass: <><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.6 6.1-5.8 2.3 2.5-5.8z"/></> };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function CollegeCard({ college, saved, onSave, comparing, onCompare, onDetails, featured = false }) {
  return <article className="college-card">
    <div className="card-top"><div className={`crest ${college.tint}`}>{college.initials}</div><button className={`icon-button ${saved ? "selected" : ""}`} aria-label="Save college" onClick={onSave}><Icon name="bookmark" size={17}/></button></div>
    <p className="eyebrow">{college.instituteType} · {college.state}</p><h3>{college.short}</h3><p className="college-full">{college.name}</p>
    <div className="place"><Icon name="pin" size={15}/>{college.city}{college.state !== "Not Reported" ? `, ${college.state}` : ""}</div>
    <div className="card-data card-data-premium"><div><span>Median package</span><b>{college.medianPackage}</b></div><div><span>Highest package</span><b>{college.highestPackage}</b></div><div><span>Annual fees</span><b>{college.annualFees}</b></div><div><span>Placement year</span><b>{college.placementYear}</b></div></div>
    {featured && <div className="top-placement">{college.placementConflict ? "Placement rate: conflicting rows" : `Placement rate: ${college.placementPct}%`} <span>· User provided, unverified</span></div>}
    <div className="branch-line">{college.branches}</div>
    <div className="card-actions"><button className="text-link profile-button" onClick={onDetails}>View details <Icon name="arrow" size={15}/></button><button className={`compare-small ${comparing ? "active" : ""}`} onClick={onCompare}><Icon name="compare" size={14}/>{comparing ? "Added" : "Compare"}</button></div>
  </article>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [compare, setCompare] = useState([]);
  const [saved, setSaved] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [stateFilter, setStateFilter] = useState("All states");
  const [instituteFilter, setInstituteFilter] = useState("All types");
  const [rankSort, setRankSort] = useState("placementPct");
  const [rankType, setRankType] = useState("All types");
  const [rankQuery, setRankQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [notice, setNotice] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [recommendType, setRecommendType] = useState("All types");
  const [recommendBranch, setRecommendBranch] = useState("");
  useEffect(() => {
    try {
      setSaved(JSON.parse(localStorage.getItem("sn-saved-colleges") || "[]"));
      setCompare(JSON.parse(localStorage.getItem("sn-compare-colleges") || "[]"));
    } catch { /* Ignore invalid browser storage and start with an empty shortlist. */ }
    const handleShortcut = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector(".search-wrap input")?.focus();
      }
      if (event.key === "Escape") setSelectedCollege(null);
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const filtered = useMemo(() => fullCollegeList.filter(c => `${c.name} ${c.short} ${c.city} ${c.state} ${c.branches}`.toLowerCase().includes(query.toLowerCase())).filter(c => instituteFilter === "All types" || c.instituteType === instituteFilter).filter(c => stateFilter === "All states" || c.state === stateFilter).filter(c => !savedOnly || saved.includes(c.short)), [query, instituteFilter, stateFilter, savedOnly, saved]);
  const rankingRows = useMemo(() => fullCollegeList.filter(c => c.rows.length).filter(c => rankType === "All types" || c.instituteType === rankType).filter(c => `${c.name} ${c.short}`.toLowerCase().includes(rankQuery.toLowerCase())).sort((a, b) => (b[rankSort] ?? -1) - (a[rankSort] ?? -1)), [rankSort, rankType, rankQuery]);
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return fullCollegeList.slice(0, 3).map(college => ({ kind: "College", label: college.short, detail: `${college.city}, ${college.state}`, value: college.short, college }));
    const collegesFound = fullCollegeList.filter(c => `${c.name} ${c.short}`.toLowerCase().includes(normalized)).slice(0, 3).map(college => ({ kind: "College", label: college.short, detail: `${college.city}, ${college.state}`, value: college.short, college }));
    const citiesFound = [...new Set(fullCollegeList.flatMap(c => [c.city, c.state]).filter(place => place !== "Not Reported" && place.toLowerCase().includes(normalized)))].slice(0, 2).map(place => ({ kind: "City / state", label: place, detail: "Browse colleges in this location", value: place }));
    const branchesFound = branchSuggestions.filter(branch => branch.toLowerCase().includes(normalized)).slice(0, 2).map(branch => ({ kind: "Branch", label: branch, detail: "Browse colleges offering this branch", value: branch }));
    return [...collegesFound, ...citiesFound, ...branchesFound].slice(0, 6);
  }, [query]);
  const recommendations = useMemo(() => fullCollegeList.filter(c => recommendType === "All types" || c.instituteType === recommendType).filter(c => !recommendBranch || c.branches.toLowerCase().includes(recommendBranch.toLowerCase())).sort((a, b) => (b.placementPct ?? -1) - (a.placementPct ?? -1)).slice(0, 3), [recommendType, recommendBranch]);
  function toggleCompare(name) {
    const next = compare.includes(name) ? compare.filter(n => n !== name) : compare.length < 4 ? [...compare, name] : null;
    if (!next) { setNotice("You can compare up to 4 colleges at a time."); window.setTimeout(() => setNotice(""), 2800); return; }
    setCompare(next); localStorage.setItem("sn-compare-colleges", JSON.stringify(next));
  }
  function toggleSaved(name) {
    const next = saved.includes(name) ? saved.filter(n => n !== name) : [...saved, name];
    setSaved(next); localStorage.setItem("sn-saved-colleges", JSON.stringify(next));
    setNotice(next.includes(name) ? `${name} saved to your shortlist.` : `${name} removed from saved colleges.`);
    window.setTimeout(() => setNotice(""), 2200);
  }
  function clearCompare() { setCompare([]); localStorage.removeItem("sn-compare-colleges"); }
  return <main>
    <Navigation/>

    <section className="hero" id="home"><div className="hero-glow glow-one"/><div className="hero-glow glow-two"/><div className="hero-grid"/>
      <div className="hero-content"><div className="announcement"><span className="pulse-dot"/> A clearer way to choose your future <span className="announcement-arrow">↗</span></div>
        <h1>Your future starts<br/>with the <span>right college.</span></h1><p className="hero-sub">Explore engineering colleges across India. Compare placements, discover opportunities, and make your next move with confidence.</p>
        <div className="search-wrap"><Icon name="search" size={19}/><input value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 150)} onKeyDown={e => e.key === "Enter" && document.querySelector('#college-directory')?.scrollIntoView({ behavior: "smooth" })} placeholder="Search colleges, cities, branches…"/><kbd>⌘ K</kbd><button onClick={() => document.querySelector('#college-directory')?.scrollIntoView({ behavior: "smooth" })}>Search</button>
          {searchFocused && <div className="suggestions">{suggestions.length ? suggestions.map(suggestion => <button key={`${suggestion.kind}-${suggestion.value}`} onMouseDown={() => { setQuery(suggestion.value); document.querySelector('#college-directory')?.scrollIntoView({ behavior: "smooth" }); }}><span className={suggestion.college ? `mini-crest ${suggestion.college.tint}` : "suggestion-kind-icon"}>{suggestion.college ? suggestion.college.initials : suggestion.kind === "Branch" ? "⌘" : "⌖"}</span><span><small className="suggestion-kind">{suggestion.kind}</small><b>{suggestion.label}</b><small>{suggestion.detail}</small></span><Icon name="arrow" size={14}/></button>) : <div className="no-results">No college, city, or branch suggestions. Try another search.</div>}</div>}
        </div><div className="search-hints"><span>Popular:</span><button onClick={() => setQuery("Bengaluru")}>Bengaluru</button><i>·</i><button onClick={() => setQuery("Computer Science")}>Computer Science</button><i>·</i><button onClick={() => setQuery("IIT")}>IITs</button></div>
        <div className="hero-actions"><a className="button-primary" href="#college-directory">Explore colleges <Icon name="arrow" size={16}/></a><button className="button-quiet" onClick={() => setRecommendOpen(true)}><span className="sparkle">✧</span> AI College Recommendation</button><a className="button-quiet compare-hero" href="#compare"><Icon name="compare" size={16}/> Compare colleges</a></div>
      </div>
      <div className="hero-aside"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="hero-emblem"><Icon name="compass" size={53}/></div><div className="float-card card-left"><span className="float-icon blue-icon">↗</span><span><b>Find your fit</b><small>Beyond the rankings</small></span></div><div className="float-card card-right"><span className="float-icon violet-icon">⌘</span><span><b>Compare clearly</b><small>Every choice, side by side</small></span></div><div className="orbit-caption">A better view of what comes next</div></div>
      <div className="hero-bottom"><span><span className="online-dot"/> Built for your next big decision</span><span>India <b>·</b> Nationwide</span></div>
    </section>

    <section className="stats-strip"><div><b>{new Set(fullCollegeList.map(c => c.short.toLowerCase())).size}</b><span>Unique college records</span></div><div><b>{placementColleges.length}</b><span>Unique colleges with placement rows</span></div><div><b>{placementRows.length}</b><span>Supplied placement rows</span></div><div className="stat-note"><span className="status-dot"/> 76 placement colleges + 3 retained directory records</div></section>

    <section className="section top-colleges-section"><div className="section-heading"><div><p className="eyebrow accent">A PLACE TO START</p><h2>Top colleges from<br/>the <span>provided data.</span></h2></div><a href="#rankings" className="all-link">See full rankings <Icon name="arrow" size={16}/></a></div><p className="top-colleges-note">Ordered by the supplied placement percentage. Figures have no source or academic year and are not verified.</p><div className="college-grid top-college-grid">{topColleges.map(c => <CollegeCard key={`top-${c.short}`} college={c} saved={saved.includes(c.short)} onSave={() => toggleSaved(c.short)} comparing={compare.includes(c.short)} onCompare={() => toggleCompare(c.short)} onDetails={() => setSelectedCollege(c)} featured/>)}</div></section>

    <section className="section how-section"><div className="section-heading"><div><p className="eyebrow accent">A CLEARER WAY TO CHOOSE</p><h2>How Student Navigator<br/><span>works for you.</span></h2></div></div><div className="how-grid"><article><span className="how-number">01</span><div className="how-icon">⌕</div><h3>Explore what matters</h3><p>Search by college name, location, or engineering branch. Narrow the list by institute type.</p></article><article><span className="how-number">02</span><div className="how-icon violet-how">↔</div><h3>Compare your options</h3><p>Shortlist colleges and compare reported figures side by side. Missing details stay clearly marked.</p></article><article><span className="how-number">03</span><div className="how-icon cyan-how">✓</div><h3>Check the source</h3><p>Use the verification status and source details to understand what each placement record can support.</p></article></div></section>

    <section className="section featured" id="college-directory"><div className="section-heading"><div><p className="eyebrow accent">START EXPLORING</p><h2>Find a college that<br className="desktop-break"/> feels like <span>your future.</span></h2></div><a href="#college-directory" className="all-link">View all colleges <Icon name="arrow" size={16}/></a></div>
      <div className="explore-tools"><div className="directory-search"><Icon name="search" size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by college, city, state or branch"/><button className="clear-search" aria-label="Clear search" onClick={() => setQuery("")} disabled={!query}>×</button></div><div className="directory-filters"><select aria-label="Filter by state" value={stateFilter} onChange={e => setStateFilter(e.target.value)}><option>All states</option>{[...new Set(fullCollegeList.map(c => c.state).filter(s => s !== "Not Reported"))].sort().map(s => <option key={s}>{s}</option>)}</select><div className="filter-pills">{["All types", "IIT", "NIT", "IIIT", "IIEST"].map(f => <button className={instituteFilter === f ? "filter-active" : ""} key={f} onClick={() => setInstituteFilter(f)}>{f}</button>)}</div><button className={`saved-filter ${savedOnly ? "filter-active" : ""}`} onClick={() => setSavedOnly(!savedOnly)}><Icon name="bookmark" size={14}/>{savedOnly ? "Saved" : `Saved${saved.length ? ` (${saved.length})` : ""}`}</button></div></div>
      <div className="college-grid">{filtered.map(c => <CollegeCard key={c.short} college={c} saved={saved.includes(c.short)} onSave={() => toggleSaved(c.short)} comparing={compare.includes(c.short)} onCompare={() => toggleCompare(c.short)} onDetails={() => setSelectedCollege(c)}/>)}{filtered.length === 0 && <div className="empty-state">{savedOnly && !saved.length ? "Save colleges with the bookmark icon to build your list." : "No colleges found. Try another college name or institute type."}<button onClick={() => { setQuery(""); setInstituteFilter("All types"); setStateFilter("All states"); setSavedOnly(false); }}>Clear filters</button></div>}</div>
      <div className="directory-footer"><span>Showing <b>{filtered.length}</b> college{filtered.length === 1 ? "" : "s"}</span><button onClick={() => { setQuery(""); setInstituteFilter("All types"); setStateFilter("All states"); setSavedOnly(false); }}>Reset filters ↺</button></div>
    </section>

    <section className="section transparency-section"><div className="section-heading"><div><p className="eyebrow accent">TRUST & TRANSPARENCY</p><h2>Know what each<br/><span>number can tell you.</span></h2></div></div><div className="transparency-grid"><article className="transparency-card verified-card"><span className="verification-pill verified-pill"><Icon name="check" size={13}/> Verified</span><h3>Source reviewed</h3><p>A verified report should include an official source URL, an academic year, and a review date. Only then should it be treated as a confirmed placement figure.</p><small>Current supplied dataset: no verified records</small></article><article className="transparency-card unverified-card"><span className="verification-pill unverified-pill">! &nbsp; Unverified</span><h3>Provided, awaiting a source</h3><p>Figures without a source URL or academic year are shown as provided. They should not be read as official or current outcomes.</p><small>All 79 supplied placement rows are unverified</small></article><div className="transparency-note">Unavailable details such as median package, fees, and placement year appear as <b>Not Reported</b>. We do not estimate them.</div></div></section>

    <section className="section compare-section" id="compare"><div className="section-heading"><div><p className="eyebrow accent">MAKE THE CALL</p><h2>See your options<br/> <span>side by side.</span></h2></div><span className="compare-limit">{compare.length} / 4 selected</span></div><div className="compare-box"><div className="compare-top"><div className="compare-icon"><Icon name="compare" size={20}/></div><div><h3>Your comparison</h3><p>{compare.length ? "Compare colleges you've added to your shortlist." : "Add colleges from the directory to start comparing."}</p></div><button className="clear-button" onClick={clearCompare} disabled={!compare.length}>Clear all</button></div>{compare.length === 0 && <div className="compare-empty">Your shortlist is empty. <button onClick={() => document.querySelector("#college-directory")?.scrollIntoView({ behavior: "smooth" })}>Choose colleges to compare ↓</button></div>}<div className="compare-columns">{fullCollegeList.filter(c => compare.includes(c.short)).map(c => <div className="compare-col" key={c.short}><div className="compare-col-head"><span className={`mini-crest ${c.tint}`}>{c.initials}</span><b>{c.short}</b><button aria-label={`Remove ${c.short}`} onClick={() => toggleCompare(c.short)}>×</button></div><span className="compare-metric-label">Average package</span><strong className={c.averagePackage === "Not Reported" ? "muted-value" : ""}>{c.averagePackage}</strong><div className="compare-line"/><span className="compare-metric-label">Highest package</span><strong className={c.highestPackage === "Not Reported" ? "muted-value" : ""}>{c.highestPackage}</strong><div className="compare-line"/><span className="compare-metric-label">Placement rate</span><strong>{c.placementPct == null ? "Not Reported" : `${c.placementPct}%`}</strong><div className="compare-line"/><span className="compare-location">{c.city}, {c.state}</span></div>)}</div><p className="compare-footnote">Figures are user-provided, without academic year/source, and are not independently verified. Conflicting repeated rows remain unresolved.</p></div></section>

    <section className="section rankings-section" id="rankings"><div className="section-heading"><div><p className="eyebrow accent">RANKINGS · USER-PROVIDED DATA</p><h2>Explore the numbers.<br/><span>Keep the context.</span></h2></div><span className="compare-limit">{placementColleges.length} unique institutes</span></div><p className="ranking-disclaimer">These supplied figures have no academic year or source URL. They are displayed as provided, are not independently verified, and should not be treated as official current rankings.</p><div className="ranking-controls"><div className="directory-search"><Icon name="search" size={16}/><input value={rankQuery} onChange={e => setRankQuery(e.target.value)} placeholder="Find an institute in the rankings"/></div><select value={rankType} onChange={e => setRankType(e.target.value)} aria-label="Filter rankings by institute type"><option>All types</option><option>IIT</option><option>NIT</option><option>IIIT</option><option>IIEST</option></select><label>Sort by<select value={rankSort} onChange={e => setRankSort(e.target.value)}><option value="placementPct">Placement percentage</option><option value="highestLpa">Highest package</option><option value="averageLpa">Average package</option></select></label></div><div className="rank-table-wrap"><table className="rank-table"><thead><tr><th>#</th><th>College</th><th>Institute</th><th>Placement</th><th>Highest package</th><th>Average package</th><th></th></tr></thead><tbody>{rankingRows.map((c,index) => <tr key={c.short}><td className="rank-number">{index+1}</td><td><b>{c.name}</b>{c.rows.length > 1 && <small className="conflict-label">{c.rows.length} supplied rows · conflict retained</small>}</td><td><span className={`type-tag ${c.instituteType.toLowerCase()}`}>{c.instituteType}</span></td><td>{c.placementConflict ? <span className="conflict-value">Conflicting values</span> : c.placementPct == null ? "Not Reported" : `${c.placementPct}%`}</td><td>{c.highestPackage}</td><td>{c.averagePackage}</td><td><button className={`compare-small ${compare.includes(c.short) ? "active" : ""}`} onClick={() => toggleCompare(c.short)}><Icon name="compare" size={13}/>{compare.includes(c.short) ? "Added" : "Compare"}</button></td></tr>)}{rankingRows.length===0&&<tr key="no-rankings"><td colSpan="7" className="no-rankings">No institutes match. Try another search or institute type.</td></tr>}</tbody></table></div><p className="compare-footnote">Package sorting converts crore amounts to LPA for ordering; display values retain the supplied units. Values containing “+” sort as lower bounds. Conflicting rows are retained and excluded from numeric ordering.</p></section>

    <section className="cta" id="about"><div className="cta-glow"/><div className="cta-content"><span className="eyebrow">YOUR JOURNEY, BETTER INFORMED</span><h2>The next chapter is yours<br/><span>to navigate.</span></h2><p>Start exploring engineering colleges with a clearer picture of what matters to you.</p><a className="button-primary" href="#college-directory">Find your college <Icon name="arrow" size={16}/></a></div><div className="cta-mark"><Icon name="compass" size={104}/></div></section>

    <footer className="footer"><a className="brand" href="#home"><span className="brand-mark"><Icon name="compass" size={18}/></span><span>student<span className="brand-light">navigator</span></span></a><span className="footer-tag">Navigate Your Future. Compare Your Opportunities.</span><div className="footer-links"><a href="#college-directory">Colleges</a><a href="#compare">Compare</a><a href="#about">About</a><a href="/admin/login">Admin</a></div><span className="copyright">© 2025 Student Navigator</span></footer>
    {compare.length > 0 && <a className="compare-fab" href="#compare"><Icon name="compare" size={16}/>{compare.length} colleges selected <span>Compare now →</span></a>}
    {notice && <div className="toast" role="status">{notice}</div>}
    {recommendOpen && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setRecommendOpen(false); }}><section className="college-modal recommendation-modal" role="dialog" aria-modal="true" aria-labelledby="recommend-title"><button className="modal-close" aria-label="Close recommendations" onClick={() => setRecommendOpen(false)}>×</button><span className="eyebrow accent">PERSONALIZED SHORTLIST</span><h2 id="recommend-title">Find colleges that fit.</h2><p className="recommend-intro">Choose a type and branch to narrow the directory to colleges matching your interests.</p><div className="recommend-filters"><label>Institute type<select value={recommendType} onChange={event => setRecommendType(event.target.value)}><option>All types</option><option>IIT</option><option>NIT</option><option>IIIT</option><option>IIEST</option></select></label><label>Branch<select value={recommendBranch} onChange={event => setRecommendBranch(event.target.value)}><option value="">Any branch</option>{branchSuggestions.map(branch => <option key={branch} value={branch}>{branch}</option>)}</select></label></div><small className="recommend-disclaimer">This is a directory-based matching preview, not an external AI service. Placement data shown here is user-provided and unverified.</small><div className="recommend-results">{recommendations.length ? recommendations.map(c => <div className="recommend-result" key={c.short}><span className={`mini-crest ${c.tint}`}>{c.initials}</span><span><b>{c.short}</b><small>{c.instituteType} · {c.placementPct == null ? "Placement not reported" : `${c.placementPct}% placement (unverified)`}</small></span><button onClick={() => { setRecommendOpen(false); setSelectedCollege(c); }}>View <Icon name="arrow" size={13}/></button></div>) : <p className="no-results">No colleges match those filters in the current directory.</p>}</div><button className="recommend-browse" onClick={() => { setRecommendOpen(false); document.querySelector("#college-directory")?.scrollIntoView({ behavior: "smooth" }); }}>Browse all colleges →</button></section></div>}
    {selectedCollege && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedCollege(null); }}><section className="college-modal" role="dialog" aria-modal="true" aria-labelledby="college-modal-title"><button className="modal-close" aria-label="Close details" onClick={() => setSelectedCollege(null)}>×</button><div className={`crest ${selectedCollege.tint}`}>{selectedCollege.initials}</div><p className="eyebrow accent">{selectedCollege.instituteType} · {selectedCollege.state}</p><h2 id="college-modal-title">{selectedCollege.short}</h2><p className="college-full">{selectedCollege.name}</p><div className="place"><Icon name="pin" size={15}/>{selectedCollege.city}, {selectedCollege.state}</div><div className="modal-info"><span>Engineering branches</span><b>{selectedCollege.branches}</b><span>Median package</span><b>{selectedCollege.medianPackage}</b><span>Highest package</span><b>{selectedCollege.highestPackage}</b><span>Annual fees</span><b>{selectedCollege.annualFees}</b><span>Placement year</span><b>{selectedCollege.placementYear}</b><small>Source and academic year were not supplied. Figures are shown as user-provided and unverified. {selectedCollege.rows.length > 1 ? `All ${selectedCollege.rows.length} repeated rows have been retained; conflicting values have not been combined.` : ""}</small></div>{selectedCollege.short === "IIT Madras" && <a className="iitm-profile-open" href="/colleges/iit-madras">View full IIT Madras profile →</a>}<div className="modal-actions"><button className="button-quiet" onClick={() => toggleSaved(selectedCollege.short)}><Icon name="bookmark" size={15}/>{saved.includes(selectedCollege.short) ? "Remove saved" : "Save college"}</button><button className="button-primary" onClick={() => toggleCompare(selectedCollege.short)}><Icon name="compare" size={15}/>{compare.includes(selectedCollege.short) ? "Remove from compare" : "Add to compare"}</button></div></section></div>}
  </main>;
}
