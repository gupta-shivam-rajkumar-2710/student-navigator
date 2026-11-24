import { NextResponse } from "next/server";
import { adminSession } from "../../../../../lib/supabase-admin";

async function jsonRequest(session, path, options = {}) {
  const response = await fetch(`${session.url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: { apikey: session.anonKey, authorization: `Bearer ${session.token}`, accept: "application/json", ...(options.body !== undefined ? { "content-type": "application/json" } : {}), ...(options.prefer ? { prefer: options.prefer } : {}) },
    body: options.body === undefined ? undefined : JSON.stringify(options.body), cache: "no-store",
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  return { ok: response.ok, status: response.status, data };
}

async function reportBelongsToIitMadras(session, reportId) {
  const college = await jsonRequest(session, "colleges?slug=eq.iit-madras&select=id&limit=1");
  const collegeId = college.data?.[0]?.id;
  if (!college.ok || !collegeId) return false;
  const report = await jsonRequest(session, `placement_reports?id=eq.${encodeURIComponent(reportId)}&college_id=eq.${collegeId}&select=id&limit=1`);
  return report.ok && Boolean(report.data?.[0]);
}

function nullableValue(value, label) {
  if (value === null || value === "") return { value: null };
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 9999) return { error: `${label} must be between 0 and 9999 LPA, or left empty.` };
  return { value: number };
}

function validate(body, { adding = false } = {}) {
  const departmentCode = String(body.department_code || "").trim().toUpperCase();
  if (adding && !/^[A-Z0-9-]{1,12}$/.test(departmentCode)) return { error: "Department code must use 1–12 letters, numbers, or hyphens." };
  const average = nullableValue(body.average_package_lpa, "Average CTC");
  const median = nullableValue(body.median_package_lpa, "Median CTC");
  if (average.error || median.error) return { error: average.error || median.error };
  const source = body.source_url === undefined ? undefined : String(body.source_url).trim();
  if (source && !/^https:\/\//i.test(source)) return { error: "Source URL must use HTTPS." };
  const status = body.verification_status || "pending_official_verification";
  if (!["unverified", "pending_official_verification", "verified", "rejected"].includes(status)) return { error: "Select a supported verification status." };
  return { departmentCode, average: average.value, median: median.value, source, status };
}

export async function POST(request) {
  const session = await adminSession();
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body.report_id || !(await reportBelongsToIitMadras(session, body.report_id))) return NextResponse.json({ error: "Placement report was not found for IIT Madras." }, { status: 404 });
  const validated = validate(body, { adding: true });
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
  const branch = {
    placement_report_id: body.report_id,
    branch_name: validated.departmentCode,
    department_code: validated.departmentCode,
    degree: "B.Tech",
    average_package_lpa: validated.average,
    median_package_lpa: validated.median,
    currency: "INR",
    package_unit: "LPA",
    source_url: validated.source || null,
    verification_status: validated.status,
  };
  const saved = await jsonRequest(session, "branch_placements?on_conflict=placement_report_id,degree,department_code", { method: "POST", prefer: "resolution=merge-duplicates,return=representation", body: [branch] });
  if (!saved.ok) return NextResponse.json({ error: saved.data?.message || "Could not save branch data." }, { status: saved.status });
  return NextResponse.json({ branch: saved.data?.[0] }, { status: 201 });
}

export async function PATCH(request) {
  const session = await adminSession();
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body.id || !body.report_id || !(await reportBelongsToIitMadras(session, body.report_id))) return NextResponse.json({ error: "Placement report was not found for IIT Madras." }, { status: 404 });
  const validated = validate(body);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
  const updated = await jsonRequest(session, `branch_placements?id=eq.${encodeURIComponent(body.id)}&placement_report_id=eq.${encodeURIComponent(body.report_id)}`, {
    method: "PATCH", prefer: "return=representation", body: { average_package_lpa: validated.average, median_package_lpa: validated.median, source_url: validated.source, verification_status: validated.status, updated_at: new Date().toISOString() },
  });
  if (!updated.ok) return NextResponse.json({ error: updated.data?.message || "Could not update branch data." }, { status: updated.status });
  return NextResponse.json({ branch: updated.data?.[0] });
}

export async function DELETE(request) {
  const session = await adminSession();
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body.id || !body.report_id || !(await reportBelongsToIitMadras(session, body.report_id))) return NextResponse.json({ error: "Placement report was not found for IIT Madras." }, { status: 404 });
  const removed = await jsonRequest(session, `branch_placements?id=eq.${encodeURIComponent(body.id)}&placement_report_id=eq.${encodeURIComponent(body.report_id)}`, { method: "DELETE" });
  if (!removed.ok) return NextResponse.json({ error: removed.data?.message || "Could not remove the branch." }, { status: removed.status });
  return NextResponse.json({ ok: true });
}
