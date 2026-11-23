// Imported exactly from the user-provided placement dataset.
// Package strings retain their supplied units; null represents an em dash.
// These rows have no report year or source URL, so they must not be presented as verified.
export const placementRows = [
  ["IIT BHU (Varanasi)",92,"2.2 Cr","23 LPA"],
  ["IIIT Allahabad",92,"1.2 Cr","33 LPA"],
  ["IIT Kanpur",91,"2.2 Cr","26 LPA"],
  ["IIT Delhi",91,"2+ Cr","25 LPA"],
  ["IIT Hyderabad",90,"2.5 Cr","36 LPA"],
  ["IIIT Bangalore",90,"1.4 Cr","25 LPA"],
  ["NIT Jamshedpur",90,"1.4 Cr","14 LPA"],
  ["IIIT Hyderabad",90,"1+ Cr","26 LPA"],
  ["IIT Roorkee",89,"2.0 Cr","23 LPA"],
  ["IIT Indore",89,"1.37 Cr","24 LPA"],
  ["IIT Guwahati",88,"2.0 Cr","25 LPA"],
  ["NIT Warangal",88,"1.27 Cr","26 LPA"],
  ["IIT Madras",85,"4.3 Cr","27 LPA"],
  ["NIT Rourkela",85,"62 LPA","13 LPA"],
  ["IIT (ISM) Dhanbad",84,"83 LPA","23 LPA"],
  ["IIIT Delhi",83,"1.07 Cr","20 LPA"],
  ["IIT Bhubaneswar",84,"67 LPA","18 LPA"],
  ["IIT Kharagpur",83,"2.6 Cr","21 LPA"],
  ["NIT Trichy",83,"64 LPA","18 LPA"],
  ["NIT Allahabad",82,"72 LPA","20 LPA"],
  ["IIT Patna",81,"1.1 Cr","26 LPA"],
  ["NIT Surathkal",81,"63 LPA","17 LPA"],
  ["NIT Calicut",81,"56 LPA","12 LPA"],
  ["IIT Jodhpur",80,"1.1 Cr","19 LPA"],
  ["IIIT Gwalior",80,"67 LPA","18 LPA"],
  ["IIT Mandi",80,"60 LPA","20 LPA"],
  ["IIT Bombay",79,"1.4 Cr","24 LPA"],
  ["NIT Jaipur",79,"64 LPA","12 LPA"],
  ["IIT Gandhinagar",79,"62 LPA","17 LPA"],
  ["IIT Jabalpur",78,"84 LPA","17 LPA"],
  ["NIT Durgapur",78,"51 LPA","14 LPA"],
  ["NIT Silchar",77,"60 LPA","12 LPA"],
  ["NIT Nagpur",76,"64 LPA","12 LPA"],
  ["NIT Hamirpur",75,"3.4 Cr","16 LPA"],
  ["NIT Allahabad",75,"72 LPA","20 LPA"],
  ["IIT Ropar",75,"65 LPA","22 LPA"],
  ["NIT Jalandhar",75,"52 LPA","11 LPA"],
  ["NIT Patna",75,"43 LPA","12 LPA"],
  ["IIIT Kancheepuram",74,"35 LPA","9 LPA"],
  ["IIT Jammu",73,"53 LPA","19 LPA"],
  ["NIT Delhi",72,"87 LPA","16 LPA"],
  ["NIT Surat",72,"74 LPA","11 LPA"],
  ["IIIT Bhagalpur",71,"84 LPA","10 LPA"],
  ["NIT Bhopal",71,"64 LPA","11 LPA"],
  ["IIEST Shibpur",71,"56 LPA","10 LPA"],
  ["IIT Bhopal",71,null,"12 LPA"],
  ["IIT Guwahati",70,null,"13 LPA"],
  ["IIT Tirupati",69,"65 LPA","22 LPA"],
  ["IIT Palakkad",69,"52 LPA","19 LPA"],
  ["NIT Srinagar",69,"36 LPA","10 LPA"],
  ["NIT Meghalaya",68,"52 LPA",null],
  ["IIIT Kota",68,null,"10 LPA"],
  ["IIIT Raichur",68,null,"14 LPA"],
  ["NIT Kurukshetra",67,"63 LPA","13 LPA"],
  ["IIT Bhilai",67,"48 LPA","12 LPA"],
  ["IIIT Kurnool",67,null,"9 LPA"],
  ["NIT Raipur",66,"60 LPA","11 LPA"],
  ["NIT Puducherry",66,"22 LPA","8 LPA"],
  ["IIT Dharwad",65,"52 LPA","13 LPA"],
  ["IIIT Vadodara",65,null,"12 LPA"],
  ["IIIT Lucknow",65,null,"17 LPA"],
  ["IIT Goa",64,"60 LPA","18 LPA"],
  ["NIT Agartala",64,"63 LPA","10 LPA"],
  ["IIIT Surat",64,null,"14 LPA"],
  ["IIIT Agartala",63,null,"12 LPA"],
  ["NIT Arunachal Pradesh",62,"58 LPA","8 LPA"],
  ["NIT Goa",62,"21 LPA","8 LPA"],
  ["IIT Dharwad",61,"78 LPA","12 LPA"],
  ["IIIT Pune",61,null,null],
  ["IIIT Ranchi",60,"54 LPA",null],
  ["IIT Nagpur",60,"60 LPA","14 LPA"],
  ["NIT Manipur",60,"22 LPA","8 LPA"],
  ["IIT Kottayam",60,null,"9 LPA"],
  ["IIT Sri City",59,"1.2 Cr","18 LPA"],
  ["NIT Andhra Pradesh",59,"23 LPA","7 LPA"],
  ["NIT Mizoram",59,"21 LPA","8 LPA"],
  ["IIIT Bhubaneswar",59,"18 LPA","9 LPA"],
  ["IIIT Naya Raipur",59,null,null],
  ["IIT Una",58,null,"9 LPA"],
];

const lpaValue = (value) => {
  if (value == null) return null;
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return null;
  return value.includes("Cr") ? amount * 100 : amount;
};

export const placementColleges = Object.values(placementRows.reduce((result, [name, placementPct, highestPackage, averagePackage], sourceIndex) => {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const row = { name, placementPct, highestPackage, averagePackage, highestLpa: lpaValue(highestPackage), averageLpa: lpaValue(averagePackage), sourceIndex };
  if (!result[key]) result[key] = { key, name, instituteType: name.startsWith("IIIT") ? "IIIT" : name.startsWith("IIEST") ? "IIEST" : name.startsWith("NIT") ? "NIT" : "IIT", rows: [] };
  result[key].rows.push(row);
  return result;
}, {}));

export function placementDisplay(college, field) {
  const values = [...new Set(college.rows.map(row => row[field]))];
  if (!values.length) return "Not Reported";
  if (values.length > 1) return "Conflicting supplied values";
  return values[0] ?? "Not Reported";
}
