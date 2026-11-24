export const IIT_MADRAS_SOURCE = "https://www.reddit.com/r/Btechtards/comments/1x0xt4j/iit_madras_20252026_placement_stats_official/";
export const IIT_MADRAS_YEAR = "2025–26";
export const IIT_MADRAS_VERIFICATION = "pending_official_verification";

export const iitMadrasBtechRows = [
  { departmentCode: "AE", medianCtc: 26.8, averageCtc: 39.0 },
  { departmentCode: "AMBE", medianCtc: null, averageCtc: null },
  { departmentCode: "BT", medianCtc: null, averageCtc: null },
  { departmentCode: "CH", medianCtc: 21.1, averageCtc: 23.1 },
  { departmentCode: "CY", medianCtc: null, averageCtc: null },
  { departmentCode: "CE", medianCtc: 20.2, averageCtc: 22.4 },
  { departmentCode: "CS", medianCtc: 44.5, averageCtc: 51.4 },
  { departmentCode: "DSAI", medianCtc: null, averageCtc: null },
  { departmentCode: "EE", medianCtc: 33.5, averageCtc: 35.7 },
  { departmentCode: "ED", medianCtc: null, averageCtc: null },
  { departmentCode: "HS", medianCtc: null, averageCtc: null },
  { departmentCode: "MS", medianCtc: null, averageCtc: null },
  { departmentCode: "MA", medianCtc: null, averageCtc: null },
  { departmentCode: "ME", medianCtc: 20.5, averageCtc: 22.0 },
  { departmentCode: "MM", medianCtc: 20.9, averageCtc: 20.9 },
  { departmentCode: "OE", medianCtc: 16.5, averageCtc: 20.9 },
  { departmentCode: "PH", medianCtc: 22.6, averageCtc: 32.7 },
];

export function getIitMadrasSummary(rows) {
  const averageRows = rows.filter(row => row.averageCtc != null);
  const medianRows = rows.filter(row => row.medianCtc != null);
  const mean = averageRows.length ? averageRows.reduce((total, row) => total + row.averageCtc, 0) / averageRows.length : null;
  const highestAverage = averageRows.length ? averageRows.reduce((best, row) => row.averageCtc > best.averageCtc ? row : best, averageRows[0]) : null;
  const highestMedian = medianRows.length ? medianRows.reduce((best, row) => row.medianCtc > best.medianCtc ? row : best, medianRows[0]) : null;
  return {
    availableBranches: averageRows.length,
    totalBranches: rows.length,
    unweightedMeanBranchAverage: mean,
    highestAverage,
    highestMedian,
  };
}
