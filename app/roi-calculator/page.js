"use client";

import { useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { calculatePlacementRoi } from "./roi-calculations.mjs";

const emptyForm = { collegeName: "", courseName: "", totalFees: "", annualPackage: "", courseDuration: "4" };
const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const percent = value => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

function recoveryText(months) {
  if (!Number.isFinite(months)) return "Not Reported";
  if (months < 1) return `${(months * 30).toFixed(0)} days`;
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  if (!years) return `${months.toFixed(1)} months`;
  if (!remainingMonths) return `${years} ${years === 1 ? "year" : "years"}`;
  return `${years}y ${remainingMonths}m`;
}

function Metric({ label, value, note, tone = "" }) {
  return <article className={`roi-metric ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>;
}

export default function RoiCalculatorPage() {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      setHistory(JSON.parse(localStorage.getItem("sn-roi-history") || "[]"));
      setComparisons(JSON.parse(localStorage.getItem("sn-roi-comparisons") || "[]"));
    } catch { /* Invalid or unavailable browser storage starts with empty lists. */ }
  }, []);

  const result = useMemo(() => calculatePlacementRoi(form), [form]);
  const valid = !result.error && Boolean(form.courseName.trim());
  const maxFees = Math.max(1, ...comparisons.map(item => item.totalFees));
  const maxPackage = Math.max(1, ...comparisons.map(item => item.annualPackage));

  function update(field, value) { setForm(current => ({ ...current, [field]: value })); }
  function calculate(event) {
    event.preventDefault();
    setSubmitted(true);
  }
  function reset() {
    setForm(emptyForm);
    setSubmitted(false);
  }
  function saveHistory() {
    if (!valid) return;
    const entry = { ...result, collegeName: form.collegeName.trim() || "College not specified", courseName: form.courseName.trim(), savedAt: new Date().toISOString() };
    const next = [entry, ...history].slice(0, 10);
    setHistory(next);
    localStorage.setItem("sn-roi-history", JSON.stringify(next));
    setNotice("Calculation saved in this browser.");
    window.setTimeout(() => setNotice(""), 2400);
  }
  function addComparison() {
    if (!valid || !form.courseName.trim()) return;
    if (comparisons.length >= 6) {
      setNotice("You can compare up to 6 courses at a time.");
      window.setTimeout(() => setNotice(""), 2400);
      return;
    }
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, collegeName: form.collegeName.trim() || "College not specified", courseName: form.courseName.trim(), totalFees: result.totalFees, annualPackage: result.annualPackage, courseDuration: result.courseDuration, firstYearRoi: result.firstYearRoi, multiYearGrossRoi: result.multiYearGrossRoi, recoveryMonths: result.recoveryMonths };
    const next = [...comparisons, entry];
    setComparisons(next);
    localStorage.setItem("sn-roi-comparisons", JSON.stringify(next));
    setNotice("Added to your comparison.");
    window.setTimeout(() => setNotice(""), 2400);
  }
  function removeComparison(id) {
    const next = comparisons.filter(item => item.id !== id);
    setComparisons(next);
    localStorage.setItem("sn-roi-comparisons", JSON.stringify(next));
  }
  function loadHistory(entry) {
    setForm({ collegeName: entry.collegeName === "College not specified" ? "" : entry.collegeName, courseName: entry.courseName, totalFees: String(entry.totalFees), annualPackage: String(entry.annualPackage), courseDuration: String(entry.courseDuration) });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function removeHistory(savedAt) {
    const next = history.filter(entry => entry.savedAt !== savedAt);
    setHistory(next);
    localStorage.setItem("sn-roi-history", JSON.stringify(next));
  }

  return <main className="roi-page">
    <Navigation/>
    <section className="roi-hero"><div className="hero-grid"/><div className="roi-hero-content"><span className="announcement"><span className="pulse-dot"/> PLAN YOUR INVESTMENT</span><h1>Make your next move<br/>with <span>the full picture.</span></h1><p>Estimate how course fees compare with a placement package, then compare multiple college options side by side.</p><div className="roi-hero-note"><span>₹</span><small>Transparent inputs · Clear assumptions · No guaranteed salary claims</small></div></div><div className="roi-orbit"><div className="roi-orbit-core">ROI</div><span className="roi-orbit-label label-one">Fees</span><span className="roi-orbit-label label-two">Outcomes</span></div></section>

    <div className="roi-content">
      <section className="roi-layout" aria-label="Placement return on investment calculator">
        <div className="roi-form-card"><div className="roi-section-head"><div><span className="eyebrow accent">YOUR COURSE DETAILS</span><h2>Build your estimate</h2><p>Enter the figures you want to evaluate. College name is optional.</p></div><span className="roi-step">01 <i>/ 02</i></span></div>
          <form onSubmit={calculate} noValidate>
            <div className="roi-field"><label htmlFor="roi-college">College name <span>Optional</span></label><input id="roi-college" value={form.collegeName} onChange={e => update("collegeName", e.target.value)} placeholder="e.g. RV College of Engineering" autoComplete="organization"/></div>
            <div className="roi-field"><label htmlFor="roi-course">Course name</label><input id="roi-course" value={form.courseName} onChange={e => update("courseName", e.target.value)} placeholder="e.g. B.Tech Computer Science" required maxLength={100}/>{submitted && !form.courseName.trim() && <small className="field-error">Enter a course name.</small>}</div>
            <div className="roi-field"><label htmlFor="roi-fees">Total course fees <span>₹ INR</span></label><div className="rupee-input"><b>₹</b><input id="roi-fees" type="number" min="1" step="1" inputMode="decimal" value={form.totalFees} onChange={e => update("totalFees", e.target.value)} placeholder="8,00,000" required/></div>{submitted && result.error?.includes("course fees") && <small className="field-error">{result.error}</small>}</div>
            <div className="roi-field"><label htmlFor="roi-package">Average placement package <span>Per annum · ₹ INR</span></label><div className="rupee-input"><b>₹</b><input id="roi-package" type="number" min="1" step="1" inputMode="decimal" value={form.annualPackage} onChange={e => update("annualPackage", e.target.value)} placeholder="12,00,000" required/></div>{submitted && result.error?.includes("package") && <small className="field-error">{result.error}</small>}</div>
            <div className="roi-field duration-field"><label htmlFor="roi-duration">Course duration</label><div className="duration-input"><input id="roi-duration" type="number" min="0.5" max="10" step="0.5" value={form.courseDuration} onChange={e => update("courseDuration", e.target.value)} required/><span>years</span></div>{submitted && result.error?.includes("duration") && <small className="field-error">{result.error}</small>}</div>
            <div className="roi-form-actions"><button type="button" className="button-quiet" onClick={reset}>Reset</button><button type="submit" className="button-primary">Calculate ROI <span aria-hidden="true">→</span></button></div>
          </form>
          <p className="roi-form-footnote">Estimates use gross annual package figures and do not account for taxes, living costs, loans, interest, or salary growth.</p>
        </div>

        <div className="roi-results-card"><div className="roi-section-head"><div><span className="eyebrow accent">ESTIMATED OUTCOME</span><h2>Your ROI snapshot</h2><p>Results update as you enter valid values.</p></div><span className="result-mark">↗</span></div>
          {!valid ? <div className="roi-empty"><div className="empty-chart">₹</div><b>Your estimate will appear here</b><span>Enter fees, package, and course duration to see a projection.</span></div> : <>
            <div className="investment-banner"><span>Total education investment</span><strong>{money(result.totalFees)}</strong><small>{form.collegeName.trim() || "College not specified"} · {form.courseName.trim() || "Course not specified"}</small></div>
            <div className="roi-metrics"><Metric label="Average placement package" value={`${money(result.annualPackage)} / year`} note="Gross package estimate"/><Metric label="Estimated fee recovery" value={recoveryText(result.recoveryMonths)} note={`${result.recoveryMonths.toFixed(1)} months at full gross package`} /><Metric label="First-year ROI" value={percent(result.firstYearRoi)} note="Annual package compared with total fees" tone={result.firstYearRoi >= 0 ? "positive" : "negative"}/><Metric label="Multi-year gross ROI" value={percent(result.multiYearGrossRoi)} note={`${result.courseDuration} years · before deductions`} tone={result.multiYearGrossRoi >= 0 ? "positive" : "negative"}/></div>
            <div className="gross-earnings"><span><i>↗</i> Total estimated gross earnings</span><strong>{money(result.grossEarnings)}</strong><small>{money(result.annualPackage)} × {result.courseDuration} years. This is not take-home salary.</small></div>
            <div className="result-actions"><button className="button-quiet" onClick={saveHistory}>Save calculation</button><button className="button-primary" onClick={addComparison}>Add to comparison <span aria-hidden="true">+</span></button></div>
          </>}
        </div>
      </section>

      {comparisons.length > 0 && <section className="roi-comparison"><div className="roi-section-head"><div><span className="eyebrow accent">SIDE-BY-SIDE VIEW</span><h2>Compare your options</h2><p>Up to 6 estimates, stored in this browser.</p></div><span className="roi-step">{comparisons.length} <i>/ 06</i></span></div>
        <div className="roi-comparison-grid">{comparisons.map(item => <article className="roi-compare-card" key={item.id}><div className="roi-compare-title"><span><small>{item.courseName}</small><b>{item.collegeName}</b></span><button onClick={() => removeComparison(item.id)} aria-label={`Remove ${item.collegeName} from comparison`}>×</button></div><div className="roi-compare-meta"><span>Fees <b>{money(item.totalFees)}</b></span><span>Package / year <b>{money(item.annualPackage)}</b></span></div><div className="roi-chart-row"><span>Annual package</span><div className="roi-bar-track"><i className="package-bar" style={{ width: `${Math.max(4, (item.annualPackage / maxPackage) * 100)}%` }}/></div><b>{money(item.annualPackage)}</b></div><div className="roi-chart-row"><span>Course fees</span><div className="roi-bar-track"><i className="fees-bar" style={{ width: `${Math.max(4, (item.totalFees / maxFees) * 100)}%` }}/></div><b>{money(item.totalFees)}</b></div><div className="roi-compare-footer"><span>First-year ROI <b className={item.firstYearRoi >= 0 ? "positive-text" : "negative-text"}>{percent(item.firstYearRoi)}</b></span><span>Recovery <b>{recoveryText(item.recoveryMonths)}</b></span></div></article>)}</div>
      </section>}

      {history.length > 0 && <section className="roi-history"><div className="roi-section-head"><div><span className="eyebrow accent">THIS BROWSER</span><h2>Saved calculations</h2><p>Private to this browser; not synced to an account or backend.</p></div></div><div className="roi-history-list">{history.map(entry => <article key={entry.savedAt}><span><b>{entry.collegeName}</b><small>{entry.courseName} · saved {new Date(entry.savedAt).toLocaleDateString("en-IN")}</small></span><strong>{money(entry.totalFees)} fees · {money(entry.annualPackage)} / yr</strong><button onClick={() => loadHistory(entry)}>Load</button><button aria-label={`Delete saved calculation for ${entry.collegeName}`} onClick={() => removeHistory(entry.savedAt)}>×</button></article>)}</div></section>}

      <aside className="roi-disclaimer"><span>i</span><p><b>Placement packages are estimates, not guaranteed salaries.</b> This calculator compares the inputs you provide. Actual compensation, take-home pay, employment outcomes, and time to recover fees vary by student, role, market, taxes, and other expenses. Gross earnings are not profit.</p></aside>
    </div>
    <footer className="footer roi-footer"><a className="brand" href="/"><span className="brand-mark">◉</span><span>student<span className="brand-light">navigator</span></span></a><span className="footer-tag">Navigate Your Future. Compare Your Opportunities.</span><div className="footer-links"><a href="/#college-directory">Colleges</a><a href="/#compare">Compare</a><a href="/roi-calculator">ROI Calculator</a><a href="/">Home</a></div><span className="copyright">© 2025 Student Navigator</span></footer>
    {notice && <div className="toast" role="status">{notice}</div>}
  </main>;
}
