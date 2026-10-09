const WEIGHTED = new Set(["kilogram", "gram", "liter", "millilitre"]);

export const isWeightedUnit = (unit) =>
  WEIGHTED.has(String(unit || "").toLowerCase());

export const unitLabel = (unit) => {
  const value = String(unit || "").toLowerCase();
  if (value === "kilogram") return "kg";
  if (value === "gram") return "g";
  if (value === "liter") return "L";
  if (value === "millilitre") return "ml";
  if (value === "piece") return "pc";
  return unit || "pc";
};
