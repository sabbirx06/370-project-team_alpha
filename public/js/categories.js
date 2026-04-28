// Categories page helper: keeps preset habits in sync with the user's saved habits.
// This module imports habits.js to allow calls to shared habit UI helpers.

import "./habits.js";

/**
 * Check the user's existing habits and mark matching preset checkboxes.
 */
export async function syncCategoryPage() {
  try {
    const response = await fetch("/get-habits");
    const habits = await response.json();
    const names = habits.map((h) => h.habit_name);

    document.querySelectorAll("input[type='checkbox']").forEach((el) => {
      if (names.includes(el.dataset.name)) {
        el.checked = true;
        window.strikeHabit?.(el);
      }
    });
  } catch (err) {
    console.error("Error syncing categories:", err);
  }
}

/**
 * Initialize the categories page when it loads.
 */
export function initCategories() {
  syncCategoryPage();
}
