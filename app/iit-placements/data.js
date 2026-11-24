import { iitMadrasBtechRows, IIT_MADRAS_SOURCE, IIT_MADRAS_VERIFICATION, IIT_MADRAS_YEAR } from "../colleges/iit-madras/data.js";

const source = {
  madras: IIT_MADRAS_SOURCE,
  ism: "https://www.reddit.com/r/Btechtards/comments/1xsob9a/iit_ism_dhanbad_ug_2026_batch_placement_stats/",
  kharagpur: "https://www.reddit.com/r/Btechtards/comments/1u2u01j/iit_kgp_placement_stats_202526/",
  guwahati: "https://www.reddit.com/r/Btechtards/comments/1w5dkqe/iit_guwahati_btech_placements_202526/",
  hyderabad: "https://www.reddit.com/r/Btechtards/comments/1u1ufr7/iit_h_202526_unofficial_placement_stats_till_june/",
  ropar: "https://www.reddit.com/r/Btechtards/comments/1vzwsr5/iit_ropar_2526_placements_result_of_rti/",
  jodhpur: "https://www.reddit.com/r/Btechtards/comments/1xtbbsd/iit_jodhpur_btech_2026_placement_stats_cse_median/",
};

const rows = (items, extra = {}) => items.map(([code, name, avg = null, median = null, min = null, max = null, registered = null, placed = null, degree = "B.Tech"]) => ({
  code, name, degree, averageCtc: avg, medianCtc: median, minimumCtc: min, maximumCtc: max,
  averageTc: null, medianTc: null, minimumTc: null, maximumTc: null,
  highestPackage: max, registeredStudents: registered, placedStudents: placed,
  placementPercentage: registered != null && placed != null && registered > 0 ? (placed / registered) * 100 : null,
  ...extra,
}));

const madras = rows(iitMadrasBtechRows.map(row => [row.departmentCode, row.departmentCode, row.averageCtc, row.medianCtc]), { sourceUrl: source.madras, verificationStatus: IIT_MADRAS_VERIFICATION, sourceType: "community_shared", note: "User supplied CTC summary screenshot; pending independent official verification." });

export const iitPlacementInstitutes = [
  { slug: "iit-madras", name: "Indian Institute of Technology Madras", shortName: "IIT Madras", city: "Chennai", state: "Tamil Nadu", academicYear: IIT_MADRAS_YEAR, sourceUrl: source.madras, sourceType: "community_shared", verificationStatus: "pending_official_verification", reportedAverageCtc: null, reportedAverageLabel: null, note: "B.Tech CTC values from the supplied CTC Summary screenshot; other degree columns were excluded.", branches: madras },
  { slug: "iit-ism-dhanbad", name: "Indian Institute of Technology (Indian School of Mines) Dhanbad", shortName: "IIT (ISM) Dhanbad", city: "Dhanbad", state: "Jharkhand", academicYear: "2025–26", reportedBatch: "2026", sourceUrl: source.ism, sourceType: "community_shared", verificationStatus: "unverified", reportedAverageCtc: null, reportedAverageLabel: null, note: "UG 2026 batch course average and median CTC as shown in a community-shared screenshot.", branches: rows([
    ["CH", "Chemical Engineering", 16.35, 13.70], ["CE", "Civil Engineering", 15.08, 13.65], ["CS", "Computer Science & Engineering", 29.89, 24.72], ["EE", "Electrical Engineering", 19.97, 16.34], ["EC", "Electronics & Communication Engineering", 21.25, 19.37], ["EP", "Engineering Physics", 17.46, 14.79], ["EN", "Environmental Engineering", 16.77, 10.25], ["ME", "Mechanical Engineering", 15.43, 13.46], ["MMM", "Mechanical Engineering - Mining Machinery", 12.28, 11.14], ["MME", "Minerals & Metallurgical Engineering", 11.51, 11.00], ["MN", "Mining Engineering", 12.19, 9.68], ["PE", "Petroleum Engineering", 15.25, 13.08],
  ], { sourceUrl: source.ism, verificationStatus: "unverified", sourceType: "community_shared" }) },
  { slug: "iit-kharagpur", name: "Indian Institute of Technology Kharagpur", shortName: "IIT Kharagpur", city: "Kharagpur", state: "West Bengal", academicYear: "2025–26", sourceUrl: source.kharagpur, sourceType: "community_shared_mixed_package_basis", verificationStatus: "unverified", reportedAverageCtc: null, reportedAverageLabel: null, note: "The post notes the sheet covers the first two weeks of December and mixes CTC, first-year TC, and base figures; package basis may vary by entry.", branches: rows([
    ["AE", "Aerospace", 21.36, 20, 10, 50], ["AG", "Agriculture", 20.57, 17.37, 8, 50], ["AR", "Architecture", 16.97, 12.5, 6, 50], ["BT", "Biotechnology", 22.05, 20, 7.25, 46], ["CE", "Civil", 18.70, 16, 8, 56.79], ["CH", "Chemical", 22.76, 20, 10, 50], ["CS", "Computer Science", 53.46, 38.5, 9, 220], ["CY", "Chemistry", 21.95, 18, 8, 73.3], ["EC", "Electronics", 33.33, 31, 7, 220], ["EE", "Electrical", 28.21, 26, 8, 83.2], ["EX", "Exploration Geophysics", 17.95, 17.2, 8.7, 27.2], ["GG", "Applied Geology", 21.13, 19.72, 8.5, 50], ["HS", "Economics", 25.38, 22, 11, 91.4], ["IE", "Instrumentation", 26.55, 23.9, 10, 106], ["IM", "Industrial and Systems", 23.99, 21, 7.25, 91.4], ["MA", "Mathematics", 39.11, 36.5, 12.5, 91.4], ["ME", "Mechanical", 21.74, 20, 7.5, 50], ["MF", "Manufacturing", 20.01, 19, 8.5, 39], ["MI", "Mining", 19.86, 17.22, 8, 36.8], ["MT", "Metallurgy", 18.17, 16.4, 8.7, 42], ["NA", "Ocean", 18.61, 17.1, 7, 37], ["PH", "Physics", 24.64, 22, 12, 45.6],
  ], { sourceUrl: source.kharagpur, verificationStatus: "unverified", sourceType: "community_shared_mixed_package_basis", degree: "UG", note: "Source author warns values include a mix of CTC, first-year TC, and base salary; shown as reported and not normalized." }) },
  { slug: "iit-guwahati", name: "Indian Institute of Technology Guwahati", shortName: "IIT Guwahati", city: "Guwahati", state: "Assam", academicYear: "2025–26", sourceUrl: source.guwahati, sourceType: "community_shared", verificationStatus: "unverified", reportedAverageCtc: null, reportedAverageLabel: null, note: "Department and specialization medians and averages from a community-shared 2025–26 B.Tech placements table; no student counts were visible.", branches: rows([
    ["BSBE", "Biosciences and Bioengineering", 19.98, 16.50], ["CHE", "Chemical Engineering", 23.41, 19.50], ["CHM", "Chemical Science and Technology", 19.10, 16.50], ["CE", "Civil Engineering", 18.25, 17.20], ["CSE", "Computer Science and Engineering", 48.49, 51.00], ["ECE", "Electronics and Communication Engineering", 32.66, 28.00], ["EEE", "Electronics and Electrical Engineering", 30.06, 26.50], ["MNC", "Mathematics and Computing", 36.43, 30.00], ["ME", "Mechanical Engineering", 20.35, 17.45], ["EP", "Engineering Physics", 21.84, 17.00], ["DSAI", "Data Science and Artificial Intelligence", 34.46, 28.00], ["ENE", "Energy Engineering", 21.08, 21.50], ["DES", "Design", 31.08, 25.25, null, null, null, null, "Not Reported"],
  ], { sourceUrl: source.guwahati, verificationStatus: "unverified", sourceType: "community_shared" }) },
  { slug: "iit-hyderabad", name: "Indian Institute of Technology Hyderabad", shortName: "IIT Hyderabad", city: "Hyderabad", state: "Telangana", academicYear: "2025–26", reportedBatch: "2026 (data through June 1, 2026)", sourceUrl: source.hyderabad, sourceType: "community_shared", verificationStatus: "unverified", reportedAverageCtc: null, reportedAverageLabel: null, note: "Unofficial placement screenshot through June 1, 2026. CTC and first-year Total Compensation (TC) columns are stored separately. B.Des is listed separately.", branches: rows([
    ["AI", "Artificial Intelligence", 38.12, 45.20, 17.50, 81.18, 28, 25], ["BME", "Biomedical Engineering", 24.17, 23.20, 16, 42.78, 15, 10], ["BT", "Biotechnology", 23.66, 22.00, 10, 37.44, 12, 11], ["CE", "Civil Engineering", 20.84, 18.00, 7, 59.81, 48, 38], ["CH", "Chemical Engineering", 27.63, 21.50, 7, 59.81, 36, 25], ["CO", "Computational Engineering", 37.32, 30.00, 18.75, 65.21, 14, 14], ["CSE", "Computer Science and Engineering", 55.18, 46.26, 12.50, 250, 56, 53], ["EE", "Electrical Engineering", 31.12, 31.05, 10, 59.81, 54, 43], ["EE-ICDT", "Electrical Engineering - ICDT", 29.29, 30.16, 17.50, 48.74, 13, 12], ["EP", "Engineering Physics", 30.83, 20.00, 12.50, 68.30, 24, 14], ["ES", "Engineering Science", 36.72, 36.89, 12, 65.21, 32, 23], ["IC", "Industrial Chemistry", 30.95, 32.78, 15.75, 53.36, 12, 11], ["MA", "Mathematics and Computing", 43.63, 45.79, 20.70, 81.18, 16, 14], ["ME", "Mechanical Engineering", 21.55, 18.00, 7, 59.81, 52, 35], ["MSME", "Materials Science and Metallurgical Engineering", 25.27, 25.00, 12.50, 43.86, 23, 15], ["DS", "Design (B.Des)", null, null, null, null, 2, 0, "B.Des"],
  ], { sourceUrl: source.hyderabad, verificationStatus: "unverified", sourceType: "community_shared" }).map((branch, index) => {
    const tc = [
      [29.72,26.42,17.50,55.82],[21.42,21.70,16,30.00],[21.39,20.70,9.71,37.44],[18.20,17.52,7,35.13],
      [24.14,18.50,7,49.12],[26.11,24.71,18.50,38.73],[41.06,32.28,12,250.00],[25.50,25.52,10,38.67],
      [24.46,23.91,17.50,34.34],[24.36,18.50,12.50,53.30],[27.95,28.47,12,43.86],[22.75,22.00,15.75,32.79],
      [33.03,28.51,20.70,55.82],[18.49,17.50,7,36.80],[22.73,20.70,12.50,43.86],[null,null,null,null],
    ][index];
    return { ...branch, averageTc: tc[0], medianTc: tc[1], minimumTc: tc[2], maximumTc: tc[3] };
  }) },
  { slug: "iit-ropar", name: "Indian Institute of Technology Ropar", shortName: "IIT Ropar", city: "Rupnagar", state: "Punjab", academicYear: "2025–26", sourceUrl: source.ropar, sourceType: "community_shared_rti_reported", verificationStatus: "unverified", reportedAverageCtc: 21.65, reportedAverageLabel: "Reported overall average package", note: "The Reddit post describes this as an RTI result. The ₹21.65 LPA overall average is retained as a separately reported figure; it is not a calculated branch average. Placement percentages are transcribed from the accompanying chart.", branches: rows([
    ["CSE", "Computer Science and Engineering", 33.99, 29.67, null, 82.18], ["MNC", "Mathematics and Computing", 31.09, 26.50, null, 80], ["EE", "Electrical Engineering", 21.47, 18.02, null, 50.58], ["ME", "Mechanical Engineering", 14.94, 13.08, null, 33.57], ["CHE", "Chemical Engineering", 17.38, 14.23, null, 48.99], ["CL", "Civil Engineering", 12.95, 10.87, null, 30.04], ["MME", "Metallurgical and Materials Engineering", 13.05, 9.43, null, 28.68], ["EP", "Engineering Physics", 17.76, 15.56, null, 45.20],
  ], { sourceUrl: source.ropar, verificationStatus: "unverified", sourceType: "community_shared_rti_reported" }).map((branch, index) => ({ ...branch, placementPercentage: [94.44,81.25,88.57,76,84.37,80.32,64.70,69.23][index] })) },
  { slug: "iit-jodhpur", name: "Indian Institute of Technology Jodhpur", shortName: "IIT Jodhpur", city: "Jodhpur", state: "Rajasthan", academicYear: "2025–26", reportedBatch: "2026 passing-out batch", sourceUrl: source.jodhpur, sourceType: "community_shared", verificationStatus: "unverified", reportedAverageCtc: null, reportedAverageLabel: null, note: "Student counts and salary values are transcribed from a community-shared screenshot. Placement percentages are calculated as placed ÷ registered × 100. B.S. rows are retained and separately identified.", branches: rows([
    ["CSE", "Computer Science and Engineering", 28.73, 26.76, null, null, 87, 85], ["AI-DS", "Artificial Intelligence and Data Science", 22.80, 18.00, null, null, 48, 47], ["EE", "Electrical Engineering", 16.87, 15.00, null, null, 63, 56], ["ME", "Mechanical Engineering", 12.88, 11.78, null, null, 41, 34], ["MSE", "Materials Engineering", 10.42, 7.75, null, null, 26, 22], ["BBE", "Bioscience and Bioengineering", 12.13, 12.00, null, null, 22, 18], ["CHE", "Chemical Engineering", 12.86, 12.00, null, null, 32, 25], ["ES", "Engineering Science", 18.85, 15.70, null, null, 24, 24], ["CIE", "Civil and Infrastructure Engineering", 11.45, 10.95, null, null, 29, 18], ["BS-PH", "B.S. - Physics with Specialization", 7.70, 7.50, null, null, 6, 5, "B.S."], ["BS-CH", "B.S. - Chemistry with Specialization", 8.00, 8.00, null, null, 5, 2, "B.S."],
  ], { sourceUrl: source.jodhpur, verificationStatus: "unverified", sourceType: "community_shared" }) },
];

for (const institute of iitPlacementInstitutes) {
  institute.reports = [{
    academicYear: institute.academicYear,
    sourceUrl: institute.sourceUrl,
    sourceType: institute.sourceType,
    verificationStatus: institute.verificationStatus,
    reportedAverageCtc: institute.reportedAverageCtc,
    reportedAverageLabel: institute.reportedAverageLabel,
    note: institute.note,
    branches: institute.branches,
  }];
}

export const iitBySlug = Object.fromEntries(iitPlacementInstitutes.map(institute => [institute.slug, institute]));

export function getInstituteSummary(institute) {
  const values = institute.branches;
  const knownAverage = values.filter(branch => branch.averageCtc != null);
  const btechRows = values.filter(branch => branch.degree === "B.Tech");
  const countsComplete = btechRows.length > 0 && btechRows.every(branch => branch.registeredStudents != null && branch.placedStudents != null);
  const averagesComplete = countsComplete && btechRows.every(branch => branch.averageCtc != null);
  const registeredStudents = countsComplete ? btechRows.reduce((sum, branch) => sum + branch.registeredStudents, 0) : null;
  const placedStudents = countsComplete ? btechRows.reduce((sum, branch) => sum + branch.placedStudents, 0) : null;
  const placedCountTotal = averagesComplete ? btechRows.reduce((sum, branch) => sum + branch.placedStudents, 0) : 0;
  const weightedAverageCtc = placedCountTotal > 0 ? btechRows.reduce((sum, branch) => sum + branch.averageCtc * branch.placedStudents, 0) / placedCountTotal : null;
  const sortedAverage = [...knownAverage].sort((a, b) => a.averageCtc - b.averageCtc);
  const highestBranchPackage = String(institute.sourceType || "").includes("mixed_package_basis") ? null : values.filter(branch => branch.highestPackage != null).reduce((highest, branch) => Math.max(highest, branch.highestPackage), 0) || null;
  return {
    totalBranches: values.length,
    availableAverageBranches: knownAverage.length,
    registeredStudents,
    placedStudents,
    overallPlacementPercentage: registeredStudents != null && registeredStudents > 0 ? placedStudents / registeredStudents * 100 : null,
    weightedAverageCtc,
    highestBranchAverage: sortedAverage.at(-1) || null,
    lowestBranchAverage: sortedAverage[0] || null,
    highestBranchPackage,
    reportedAverageCtc: institute.reportedAverageCtc,
  };
}
