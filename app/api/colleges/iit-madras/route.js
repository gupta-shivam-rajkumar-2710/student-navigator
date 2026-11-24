import { NextResponse } from "next/server";
import { getSupabaseConfig } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { url, anonKey } = getSupabaseConfig();
    const collegeResponse = await fetch(`${url}/rest/v1/colleges?slug=eq.iit-madras&select=id,name,short_name,city,state,college_type,website,description&limit=1`, { headers: { apikey: anonKey }, cache: "no-store" });
    if (!collegeResponse.ok) return NextResponse.json({ error: "Could not load the IIT Madras profile." }, { status: 502 });
    const [college] = await collegeResponse.json();
    if (!college) return NextResponse.json({ error: "IIT Madras is not in the connected database yet." }, { status: 404 });
    const reportResponse = await fetch(`${url}/rest/v1/placement_reports?college_id=eq.${college.id}&degree=eq.B.Tech&select=id,academic_year,degree,currency,package_unit,source_url,verification_status,is_published,branch_placements(id,department_code,branch_name,average_package_lpa,median_package_lpa,source_url,verification_status)&order=academic_year.desc`, { headers: { apikey: anonKey }, cache: "no-store" });
    if (!reportResponse.ok) return NextResponse.json({ error: "Could not load placement reports." }, { status: 502 });
    return NextResponse.json({ college, reports: await reportResponse.json() }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Placement data is unavailable." }, { status: 503 });
  }
}
