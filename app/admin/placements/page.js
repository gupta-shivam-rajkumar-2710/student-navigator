"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Navigation from "../../components/Navigation";

const statusLabels = { unverified: "Unverified", pending_official_verification: "Pending Official Verification", verified: "Verified", rejected: "Rejected" };
const statusOptions = Object.entries(statusLabels);

export default function IitMadrasAdminPlacements() {
  const [reports, setReports] = useState([]);
  const [reportId, setReportId] = useState("");
  const [draft, setDraft] = useState({});
  const [newReport, setNewReport] = useState({ academic_year: "2026–27", degree: "B.Tech", source_url: "", verification_status: "unverified" });
  const [newBranch, setNewBranch] = useState({ department_code: "", average_package_lpa: "", median_package_lpa: "", source_url: "", verification_status: "pending_official_verification" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (preferredId = "") => {
    setError("");
    try {
      const response = await fetch("/api/admin/placements/iit-madras", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load IIT Madras placement records.");
      const nextReports = result.reports || [];
      setReports(nextReports);
      const nextId = preferredId || reportId || nextReports[0]?.id || "";
      setReportId(nextId);
      const active = nextReports.find(report => report.id === nextId);
      setDraft(active ? { ...active, branch_placements: active.branch_placements || [] } : {});
    } catch (loadError) { setError(loadError.message); }
  }, [reportId]);

  useEffect(() => { load(); }, [load]);
  const activeReport = useMemo(() => reports.find(report => report.id === reportId), [reports, reportId]);

  async function send(url, method, body) {
    const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Could not save changes.");
    return result;
  }
  async function saveReport(event) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try { await send(`/api/admin/placements/iit-madras/${reportId}`, "PATCH", { academic_year: draft.academic_year, source_url: draft.source_url || "", verification_status: draft.verification_status }); await load(reportId); setMessage("Placement report saved."); }
    catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  }
  async function createReport(event) {
    event.preventDefault(); setBusy(true); setMessage(""); setError("");
    try { const result = await send("/api/admin/placements/iit-madras", "POST", newReport); await load(result.report?.id || ""); setMessage("New academic-year report created."); }
    catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  }
  async function saveBranch(row) {
    setBusy(true); setMessage(""); setError("");
    try {
      await send("/api/admin/placements/iit-madras/branches", "PATCH", { id: row.id, report_id: reportId, average_package_lpa: row.average_package_lpa === "" ? null : row.average_package_lpa, median_package_lpa: row.median_package_lpa === "" ? null : row.median_package_lpa, source_url: row.source_url || "", verification_status: row.verification_status });
      await load(reportId); setMessage(`${row.department_code || row.branch_name} saved.`);
    } catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  }
  async function addBranch(event) {
    event.preventDefault(); if (!reportId) return;
    setBusy(true); setMessage(""); setError("");
    try { await send("/api/admin/placements/iit-madras/branches", "POST", { ...newBranch, report_id: reportId, average_package_lpa: newBranch.average_package_lpa === "" ? null : newBranch.average_package_lpa, median_package_lpa: newBranch.median_package_lpa === "" ? null : newBranch.median_package_lpa }); setNewBranch({ department_code: "", average_package_lpa: "", median_package_lpa: "", source_url: "", verification_status: "pending_official_verification" }); await load(reportId); setMessage("Branch added."); }
    catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  }
  async function deleteBranch(row) {
    if (!window.confirm(`Remove ${row.department_code || row.branch_name} from this report?`)) return;
    setBusy(true); setMessage(""); setError("");
    try { await send("/api/admin/placements/iit-madras/branches", "DELETE", { id: row.id, report_id: reportId }); await load(reportId); setMessage("Branch removed."); }
    catch (saveError) { setError(saveError.message); }
    finally { setBusy(false); }
  }
  function updateBranch(id, field, value) {
    setDraft(current => ({ ...current, branch_placements: current.branch_placements.map(row => row.id === id ? { ...row, [field]: value } : row) }));
  }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin/login"; }

  return <main className="admin-placement-page"><Navigation/><div className="admin-placement-shell"><div className="admin-placement-heading"><div><span className="eyebrow accent">OWNER DASHBOARD · PLACEMENTS</span><h1>IIT Madras B.Tech report</h1><p>Edit the year report and its branch-level median and average CTC values.</p></div><button className="button-quiet" onClick={logout}>Sign out</button></div>
    {error && <div className="admin-alert error-alert" role="alert">{error}{error.includes("Sign in") || error.includes("session") ? <> <a href="/admin/login">Go to sign in →</a></> : null}</div>}
    {message && <div className="admin-alert success-alert" role="status">{message}</div>}
    {reports.length > 0 && <section className="admin-placement-panel"><div className="admin-panel-head"><div><h2>Placement reports</h2><p>{reports.length} report{reports.length === 1 ? "" : "s"} in the database</p></div><label>Academic year<select value={reportId} onChange={event => { setReportId(event.target.value); const report = reports.find(item => item.id === event.target.value); setDraft(report ? { ...report, branch_placements: report.branch_placements || [] } : {}); }}><option value="">Choose a year</option>{reports.map(report => <option value={report.id} key={report.id}>{report.academic_year} · {report.degree}</option>)}</select></label></div>
      {activeReport && <><form className="admin-report-form" onSubmit={saveReport}><label>Academic year<input value={draft.academic_year || ""} onChange={event => setDraft(current => ({ ...current, academic_year: event.target.value }))} placeholder="2025–26" required/></label><label>Source URL<input type="url" value={draft.source_url || ""} onChange={event => setDraft(current => ({ ...current, source_url: event.target.value }))} placeholder="https://…"/></label><label>Verification status<select value={draft.verification_status || "unverified"} onChange={event => setDraft(current => ({ ...current, verification_status: event.target.value }))}>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="button-primary" disabled={busy}>Save report</button></form><div className="admin-branch-table-wrap"><table className="admin-branch-table"><thead><tr><th>Department</th><th>Average CTC (LPA)</th><th>Median CTC (LPA)</th><th>Source URL</th><th>Status</th><th>Actions</th></tr></thead><tbody>{draft.branch_placements?.map(row => <tr key={row.id}><td><b>{row.department_code || row.branch_name}</b></td><td><input aria-label={`${row.department_code} average CTC`} type="number" min="0" max="9999" step="0.1" value={row.average_package_lpa ?? ""} onChange={event => updateBranch(row.id, "average_package_lpa", event.target.value)}/></td><td><input aria-label={`${row.department_code} median CTC`} type="number" min="0" max="9999" step="0.1" value={row.median_package_lpa ?? ""} onChange={event => updateBranch(row.id, "median_package_lpa", event.target.value)}/></td><td><input aria-label={`${row.department_code} source URL`} value={row.source_url || ""} onChange={event => updateBranch(row.id, "source_url", event.target.value)} placeholder="https://…"/></td><td><select aria-label={`${row.department_code} verification status`} value={row.verification_status || "unverified"} onChange={event => updateBranch(row.id, "verification_status", event.target.value)}>{statusOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></td><td><button className="admin-row-save" onClick={() => saveBranch(row)} disabled={busy}>Save</button><button className="admin-row-delete" onClick={() => deleteBranch(row)} disabled={busy}>×</button></td></tr>)}</tbody></table></div>
      <form className="admin-new-branch" onSubmit={addBranch}><h3>Add department</h3><div><label>Department code<input value={newBranch.department_code} onChange={event => setNewBranch(current => ({ ...current, department_code: event.target.value }))} placeholder="e.g. AE" required/></label><label>Average CTC (LPA)<input type="number" min="0" step="0.1" value={newBranch.average_package_lpa} onChange={event => setNewBranch(current => ({ ...current, average_package_lpa: event.target.value }))} placeholder="Not available"/></label><label>Median CTC (LPA)<input type="number" min="0" step="0.1" value={newBranch.median_package_lpa} onChange={event => setNewBranch(current => ({ ...current, median_package_lpa: event.target.value }))} placeholder="Not available"/></label><label>Source URL<input type="url" value={newBranch.source_url} onChange={event => setNewBranch(current => ({ ...current, source_url: event.target.value }))} placeholder="https://…"/></label><button className="button-primary" disabled={busy}>Add branch</button></div></form></>}
    </section>}
    <section className="admin-placement-panel create-report-panel"><div><h2>Add another academic year</h2><p>For example, 2026–27. New overall package figures remain blank unless separately reported.</p></div><form onSubmit={createReport}><label>Academic year<input value={newReport.academic_year} onChange={event => setNewReport(current => ({ ...current, academic_year: event.target.value }))} required placeholder="2026–27"/></label><label>Degree<input value={newReport.degree} onChange={event => setNewReport(current => ({ ...current, degree: event.target.value }))} required/></label><label>Source URL<input type="url" value={newReport.source_url} onChange={event => setNewReport(current => ({ ...current, source_url: event.target.value }))} placeholder="https://…"/></label><label>Verification status<select value={newReport.verification_status} onChange={event => setNewReport(current => ({ ...current, verification_status: event.target.value }))}>{statusOptions.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="button-primary" disabled={busy}>Create report</button></form></section>
    <p className="admin-secure-note">Changes are sent to Supabase with your authenticated admin session. Row-level security remains enabled; public visitors cannot edit these records.</p>
  </div></main>;
}
