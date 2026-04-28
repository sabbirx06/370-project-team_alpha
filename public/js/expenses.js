// Expense page logic: load expenses, update budget displays, and handle delete actions.

import { getBudgetColor } from "./utils.js"; // Shared helper for budget color choices.

/**
 * Load all expense entries from the backend and render them.
 */
export async function loadExpenses() {
  try {
    const response = await fetch("/get-expenses");
    const data = await response.json();
    const list = document.querySelector("#expense-list");
    if (!list) return; // If page has no expense list, skip.

    list.innerHTML = "";

    data.forEach((expense) => {
      const li = document.createElement("li");
      li.classList.add("list-group-item", "bg-transparent", "border-0", "px-0");

      li.innerHTML = `
        <div class="card mb-2 p-2 d-flex flex-row justify-content-between align-items-center fs-5">
          <span>${expense.description}</span>
          <div class="d-flex gap-2 align-items-center">
            <span class="badge badge-pill text-dark fs-5">৳ ${expense.amount}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${expense.expense_id})">✕</button>
          </div>
        </div>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading expenses:", err);
  }
}

/**
 * Delete an expense and refresh the expense list and budget summary.
 * @param {number} id - Expense ID from the server.
 */
export async function deleteExpense(id) {
  try {
    await fetch("/delete-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expense_id: id }),
    });
    await loadExpenses();
    await loadRemainingBudget();
  } catch (err) {
    console.error("Error deleting expense:", err);
  }
}

/**
 * Update the budget display and progress bar based on remaining budget.
 */
export async function loadRemainingBudget() {
  try {
    const response = await fetch("/remaining-budget");
    const data = await response.json();

    const el1 = document.querySelector("#monthly-budget");
    const el2 = document.querySelector("#dashboard-budget");
    const warningEl = document.querySelector("#budget-warning");
    const bar = document.querySelector("#budget-bar");

    const total = data.totalBudget || 0;
    const remaining = data.remaining || 0;
    const color = getBudgetColor(remaining, total);

    if (bar && total > 0) {
      let percent = (remaining / total) * 100;
      percent = Math.max(0, Math.min(percent, 100));
      bar.style.width = percent + "%";

      if (percent <= 10) bar.className = "progress-bar bg-danger";
      else if (percent <= 30) bar.className = "progress-bar bg-warning";
      else bar.className = "progress-bar bg-success";
    }

    if (el1) {
      el1.innerText = "৳ " + remaining;
      el1.style.color = color;
    }
    if (el2) {
      el2.innerText = "৳ " + remaining;
      el2.style.color = color;
    }

    if (warningEl && total > 0) {
      const percent = (remaining / total) * 100;
      if (remaining < 0) {
        warningEl.style.display = "block";
        warningEl.className = "badge bg-danger mt-2 w-100 text-center";
        warningEl.innerText = `🚨 Overspent by ৳ ${Math.abs(remaining)}`;
      } else if (percent <= 10) {
        warningEl.style.display = "block";
        warningEl.className = "badge bg-danger mt-2 w-100 text-center";
        warningEl.innerText = "⚠ Critical: Budget almost exhausted!";
      } else if (percent <= 30) {
        warningEl.style.display = "block";
        warningEl.className =
          "badge bg-warning text-dark mt-2 w-100 text-center";
        warningEl.innerText = "⚠ Warning: You are close to your limit";
      } else {
        warningEl.style.display = "none";
      }
    }

    const budgetForm = document.querySelector("#budget-form");
    const budgetActions = document.querySelector("#budget-actions");
    if (budgetForm && budgetActions) {
      if (data.hasBudget) {
        budgetForm.style.display = "none";
        budgetActions.style.display = "block";
      } else {
        budgetForm.style.display = "block";
        budgetActions.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Budget load error:", err);
  }
}

/**
 * Initialize the expenses page by loading both expenses and budget summary.
 */
export function initExpenses() {
  loadExpenses();
  loadRemainingBudget();
}

// Expose deleteExpense so the inline delete button can call it.
window.deleteExpense = deleteExpense;
