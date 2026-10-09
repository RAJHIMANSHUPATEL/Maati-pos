export const roundMoney = (n) => Math.round(Number(n) * 100) / 100;

export const formatMoney = (n) =>
  `₹${roundMoney(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
