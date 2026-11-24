import { NextResponse } from "next/server";
import { adminSession } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

async function db(session, path, options = {}) {
  const headers = { apikey: session.anonKey, authorization: `Bearer ${session.token}`, accept: "application/json" };
  if (options.body !== undefined) headers["content-type"] = "application/json";
  if (options.prefer) headers.prefer = options.prefer;
  const response = await fetch(`${session.url}/rest/v1/${path}`, { method: options.method || "GET", headers, body: options.body === undefined ? undefined : JSON.stringify(options.body), cache: "no-store" });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  return { ok: response.ok, status: response.status, data };
}

export async function GET() {
  const session = await adminSession();
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  const colleges = await db(session, "colleges?slug=eq.iit-madras&select=id,name,short_name&limit=1");
  if (!colleges.ok) return NextResponse.json({ error: colleges.data?.message || "Could not read college records." }, { status: 502 });
  const college = colleges.data?.[0];
  if (!college) return NextResponse.json({ error: "IIT Madras is not in the database. Apply migration 0003 first." }, { status: 404 });
  const reports = await db(session, `placement_reports?college_id=eq.${college.id}&select=id,academic_year,degree,currency,package_unit,source_url,verification_status,is_published,branch_placements(id,branch_name,department_code,average_package_lpa,median_package_lpa,source_url,verification_status)&order=academic_year.desc`);
  if (!reports.ok) return NextResponse.json({ error: reports.data?.message || "Could not read placement reports." }, { status: 502 });
  return NextResponse.json({ college, reports: reports.data });
}

export async function POST(request) {
  const session = await adminSession();
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const year = String(body.academic_year || "").trim();
  const degree = String(body.degree || "").trim();
  const sourceUrl = String(body.source_url || "").trim();
  const status = String(body.verification_status || "unverified");
  if (!/^\d{4}[–-]\d{2}$/.test(year) || !degree || degree.length > 30) return NextResponse.json({ error: "Enter an academic year such as 2026–27 and a degree." }, { status: 400 });
  if (sourceUrl && !/^https:\/\//i.test(sourceUrl)) return NextResponse.json({ error: "Source URL must use HTTPS." }, { status: 400 });
  if (!["unverified", "pending_official_verification", "verified", "rejected"].includes(status)) return NextResponse.json({ error: "Select a supported verification status." }, { status: 400 });
  const colleges = await db(session, "colleges?slug=eq.iit-madras&select=id&limit=1");
  const collegeId = colleges.data?.[0]?.id;
  if (!colleges.ok || !collegeId) return NextResponse.json({ error: "IIT Madras could not be found in the database." }, { status: 404 });
  const created = await db(session, "placement_reports", { method: "POST", prefer: "return=representation", body: [{ college_id: collegeId, academic_year: year, degree, currency: "INR", package_unit: "LPA", source_url: sourceUrl || null, verification_status: status, is_published: true }] });
  if (!created.ok) return NextResponse.json({ error: created.data?.message || "Could not create the placement report." }, { status: created.status === 409 ? 409 : 502 });
  return NextResponse.json({ report: created.data?.[0] }, { status: 201 });
}
