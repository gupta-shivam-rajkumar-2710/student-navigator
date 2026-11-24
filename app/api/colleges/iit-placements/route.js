import { NextResponse } from "next/server";
import { getSupabaseConfig } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { url, anonKey } = getSupabaseConfig();
    const query = "colleges?institution_category=eq.IIT&is_published=eq.true&select=slug,name,short_name,city,state,placement_reports(academic_year,degree,source_url,source_type,verification_status,data_notes,reported_average_ctc_lpa,branch_placements(branch_name,department_code,degree,average_package_lpa,median_package_lpa,minimum_ctc_lpa,maximum_ctc_lpa,average_tc_lpa,median_tc_lpa,minimum_tc_lpa,maximum_tc_lpa,highest_package_lpa,eligible_students,students_placed,placement_percentage,source_url,source_type,verification_status,data_notes))&order=short_name.asc";
    const response = await fetch(`${url}/rest/v1/${query}`, { headers: { apikey: anonKey }, cache: "no-store" });
    if (!response.ok) return NextResponse.json({ error: "Could not load IIT placement reports from Supabase." }, { status: 502 });
    const colleges = await response.json();
    const institutes = colleges.map(college => {
      const groups = new Map();
      for (const report of college.placement_reports || []) {
        if (!groups.has(report.academic_year)) groups.set(report.academic_year, []);
        groups.get(report.academic_year).push(report);
      }
      const reports = [...groups.entries()].map(([academicYear, yearReports]) => {
        const selected = yearReports.find(report => report.degree === "B.Tech") || yearReports[0];
        const branches = yearReports.flatMap(report => (report.branch_placements || []).map(branch => ({
          code: branch.department_code || branch.branch_name,
          name: branch.branch_name,
          degree: branch.degree || report.degree || "B.Tech",
          averageCtc: branch.average_package_lpa == null ? null : Number(branch.average_package_lpa),
          medianCtc: branch.median_package_lpa == null ? null : Number(branch.median_package_lpa),
          minimumCtc: branch.minimum_ctc_lpa == null ? null : Number(branch.minimum_ctc_lpa),
          maximumCtc: branch.maximum_ctc_lpa == null ? null : Number(branch.maximum_ctc_lpa),
          averageTc: branch.average_tc_lpa == null ? null : Number(branch.average_tc_lpa),
          medianTc: branch.median_tc_lpa == null ? null : Number(branch.median_tc_lpa),
          minimumTc: branch.minimum_tc_lpa == null ? null : Number(branch.minimum_tc_lpa),
          maximumTc: branch.maximum_tc_lpa == null ? null : Number(branch.maximum_tc_lpa),
          highestPackage: branch.highest_package_lpa == null ? null : Number(branch.highest_package_lpa),
          registeredStudents: branch.eligible_students == null ? null : Number(branch.eligible_students),
          placedStudents: branch.students_placed == null ? null : Number(branch.students_placed),
          placementPercentage: branch.placement_percentage == null ? null : Number(branch.placement_percentage),
          sourceUrl: branch.source_url || report.source_url,
          sourceType: branch.source_type || report.source_type || "unknown",
          verificationStatus: branch.verification_status || report.verification_status,
          note: branch.data_notes || report.data_notes,
        })));
        return {
          academicYear, sourceUrl: selected.source_url, sourceType: selected.source_type || "unknown",
          verificationStatus: selected.verification_status, note: selected.data_notes,
          reportedAverageCtc: selected.reported_average_ctc_lpa == null ? null : Number(selected.reported_average_ctc_lpa),
          reportedAverageLabel: selected.reported_average_ctc_lpa == null ? null : "Reported overall average package",
          branches,
        };
      }).sort((a, b) => b.academicYear.localeCompare(a.academicYear));
      const selected = reports[0];
      if (!selected) return null;
      return { slug: college.slug, name: college.name, shortName: college.short_name, city: college.city, state: college.state, academicYear: selected.academicYear, ...selected, reports };
    }).filter(Boolean);
    return NextResponse.json({ institutes }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error.message || "IIT placement data is unavailable." }, { status: 503 });
  }
}
