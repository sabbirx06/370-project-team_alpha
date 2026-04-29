import { getBudgetColor } from "./utils.js";

// Dashboard page logic: fetch summary stats and update the UI.
export async function loadDashboard() {
  try {
    const response = await fetch("/dashboard-data");
    const data = await response.json();

    const progress = document.querySelector("#habit-progress");
    if (progress) {
      progress.innerText = data.completed + "/" + data.totalHabits;
    }

    const budget = document.querySelector("#dashboard-budget");
    const budgetBar = document.querySelector("#budget-bar");
    const warningEl = document.querySelector("#budget-warning");

    if (budget) {
      budget.innerText = "৳ " + data.remaining;
      budget.style.color = getBudgetColor(data.remaining, data.totalBudget);
    }

    if (budgetBar && data.totalBudget > 0) {
      const percent = Math.max(
        0,
        Math.min((data.remaining / data.totalBudget) * 100, 100),
      );
      budgetBar.style.width = percent + "%";
      if (percent <= 10) budgetBar.className = "progress-bar bg-danger";
      else if (percent <= 30) budgetBar.className = "progress-bar bg-warning";
      else budgetBar.className = "progress-bar bg-success";
    }

    if (warningEl) {
      if (data.remaining < 0) {
        warningEl.style.display = "block";
        warningEl.className = "badge bg-danger mt-2";
        warningEl.innerText = `🚨 Overspent by ৳ ${Math.abs(data.remaining)}`;
      } else if (data.totalBudget > 0) {
        const percent = (data.remaining / data.totalBudget) * 100;
        if (percent <= 10) {
          warningEl.style.display = "block";
          warningEl.className = "badge bg-danger mt-2";
          warningEl.innerText = `⚠ Critical budget: ${Math.max(0, Math.round(percent))}% remaining`;
        } else if (percent <= 30) {
          warningEl.style.display = "block";
          warningEl.className = "badge bg-warning mt-2 text-dark";
          warningEl.innerText = "⚠ Budget is running low";
        } else {
          warningEl.style.display = "none";
        }
      } else {
        warningEl.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Dashboard error:", err);
  }
}

/**
 * Initialize the dashboard page when it loads.
 */
export function initDashboard() {
  loadDashboard();
}
