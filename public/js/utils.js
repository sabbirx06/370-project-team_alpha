// Utility functions used across multiple pages.
// This module keeps shared logic in one place so it can be reused.

/**
 * Choose a budget color based on how much money is left.
 * @param {number} remaining - Money left from the budget.
 * @param {number} total - Total budget amount.
 * @returns {string} - A CSS color name.
 */
export function getBudgetColor(remaining, total) {
  if (!total || total <= 0) return "lightgreen";

  const percent = (remaining / total) * 100;

  if (percent <= 10) return "red";
  if (percent <= 30) return "orange";
  return "lightgreen";
}
