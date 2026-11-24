import { NextResponse } from "next/server";
import { adminSession } from "../../../../../lib/supabase-admin";

export async function PATCH(request, { params }) {
  const session = await adminSession();
  if (session.error) return NextResponse.json({ error: session.error }, { status: session.status });
  const { reportId } = await params;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const updates = {};
  if (body.academic_year !== undefined) {
    const year = String(body.academic_year).trim();
    if (!/^\d{4}[–-]\d{2}$/.test(year)) return NextResponse.json({ error: "Enter an academic year such as 2026–27." }, { status: 400 });
    updates.academic_year = year;
  }
  if (body.source_url !== undefined) {
    const source = String(body.source_url).trim();
    if (source && !/^https:\/\//i.test(source)) return NextResponse.json({ error: "Source URL must use HTTPS." }, { status: 400 });
    updates.source_url = source || null;
  }
  if (body.verification_status !== undefined) {
    if (!["unverified", "pending_official_verification", "verified", "rejected"].includes(body.verification_status)) return NextResponse.json({ error: "Select a supported verification status." }, { status: 400 });
    updates.verification_status = body.verification_status;
  }
  const response = await fetch(`${session.url}/rest/v1/placement_reports?id=eq.${encodeURIComponent(reportId)}`, {
    method: "PATCH", headers: { apikey: session.anonKey, authorization: `Bearer ${session.token}`, "content-type": "application/json", prefer: "return=representation" },
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }), cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) return NextResponse.json({ error: text || "Could not update the report." }, { status: response.status });
  return NextResponse.json({ report: text ? JSON.parse(text)?.[0] : null });
}
