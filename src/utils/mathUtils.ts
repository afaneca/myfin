export const calculateGrowthPercentage = (
  val1?: number,
  val2?: number,
): number | undefined => {
  if (!val1 || !val2) return undefined;
  return ((val2 - val1) / Math.abs(val1)) * 100;
};
