export function calculatePlacementRoi({ totalFees, annualPackage, courseDuration }) {
  const fees = Number(totalFees);
  const annual = Number(annualPackage);
  const years = Number(courseDuration);

  if (!Number.isFinite(fees) || fees <= 0) return { error: "Enter total course fees greater than ₹0." };
  if (!Number.isFinite(annual) || annual <= 0) return { error: "Enter an average annual package greater than ₹0." };
  if (!Number.isFinite(years) || years <= 0) return { error: "Enter a course duration greater than 0 years." };

  const recoveryMonths = fees / (annual / 12);
  const firstYearRoi = ((annual - fees) / fees) * 100;
  const grossEarnings = annual * years;
  const multiYearGrossRoi = ((grossEarnings - fees) / fees) * 100;

  return { totalFees: fees, annualPackage: annual, courseDuration: years, recoveryMonths, firstYearRoi, multiYearGrossRoi, grossEarnings };
}
