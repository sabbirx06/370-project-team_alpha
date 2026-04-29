// This module contains all the code for the Habits page.
// It loads habits from the backend, renders them in the list,
// and exposes helper functions for interaction.

let allHabits = []; // Cache the habit objects so filtering works without another request.

/**
 * Render the habit list on the page.
 * @param {Array} data - Array of habit objects from the server.
 */
export function renderHabits(data) {
  const list = document.getElementById("habit-list");
  if (!list) return; // If the page doesn't have a habit list, skip rendering.

  list.innerHTML = ""; // Clear previous items before rendering.

  data.forEach((habit) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "bg-transparent", "border-0", "px-0");

    // Build the habit card using template strings.
    li.innerHTML = `
      <div class="card mb-2 p-3 d-flex flex-row align-items-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <input type="checkbox"
            ${habit.completed ? "checked" : ""}
            onchange="toggleHabit(${habit.habit_id})"
          />
          <span style="${habit.completed ? "text-decoration: line-through; opacity: 0.6;" : ""}">
            ${habit.habit_name}
          </span>
        </div>

        <span class="badge rounded-pill bg-danger">${habit.category}</span>

        <div class="d-flex align-items-center gap-2">
          <span class="badge badge-pill fs-5 text-dark">🔥 ${habit.difficulty_score}</span>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteHabit(${habit.habit_id})">✕</button>
        </div>
      </div>
    `;

    list.appendChild(li);
  });
}

/**
 * Load habits from the backend and render them on the page.
 */
export async function loadHabits() {
  try {
    const response = await fetch("/get-habits");
    const data = await response.json();
    allHabits = data;
    renderHabits(data);
  } catch (err) {
    console.error("Error loading habits:", err);
  }
}

/**
 * Load the user's current streak points and display them.
 */
export async function loadStreak() {
  try {
    const response = await fetch("/streak");
    const data = await response.json();
    const el = document.getElementById("streak-points");
    if (el) el.innerText = "🔥 " + data.streak;
  } catch (err) {
    console.error("Error loading streak:", err);
  }
}

/**
 * Mark a habit item as visually completed.
 * @param {HTMLElement} el - The checkbox element.
 */
export function strikeHabit(el) {
  const text = el.nextElementSibling;
  if (!text) return;
  text.style.textDecoration = "line-through";
  text.style.opacity = "0.5";
}

/**
 * Reset the visual style for an uncompleted habit.
 * @param {HTMLElement} el - The checkbox element.
 */
export function unstrikeHabit(el) {
  const text = el.nextElementSibling;
  if (!text) return;
  text.style.textDecoration = "none";
  text.style.opacity = "1";
}

/**
 * Toggle the completed state of a habit.
 * @param {number} id - Habit ID from the server.
 */
export async function toggleHabit(id) {
  try {
    await fetch("/toggle-habit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: id }),
    });
    await loadHabits();
    await loadStreak();
  } catch (err) {
    console.error("Error toggling habit:", err);
  }
}

/**
 * Delete a habit from the server and refresh the list.
 * @param {number} id - Habit ID from the server.
 */
export async function deleteHabit(id) {
  try {
    await fetch("/delete-habit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit_id: id }),
    });
    await loadHabits();
    await loadStreak();
  } catch (err) {
    console.error("Error deleting habit:", err);
  }
}

/**
 * Handle toggle interaction for preset habit cards on the categories page.
 * This is used when the user checks or unchecks a predefined habit.
 */
export async function togglePresetHabit(el) {
  /* el is the button that was clicked by the user
   * dataset -> way to access custom attributes on HTML elems
   * that start with data-somethinggoeshere
   * retrieved through el.dataset.somethinggoeshere
   */
  const name = el.dataset.name;
  const difficulty = el.dataset.difficulty;
  const category = el.dataset.category;

  try {
    if (el.checked) {
      const response = await fetch("/add-habit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, difficulty, category }),
      });
      if (!response.ok) throw new Error("Failed to add habit");
      strikeHabit(el);
    } else {
      await fetch("/delete-habit-by-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      unstrikeHabit(el);
    }
  } catch (err) {
    console.error("Error toggling preset habit:", err);
    el.checked = !el.checked; // reverts checkbox if there was an error
  }
}

/**
 * Filter the rendered habit list by category.
 * @param {string} category - Category selected by the user.
 */
export function filterHabits(category) {
  if (category === "all") {
    renderHabits(allHabits);
  } else {
    renderHabits(allHabits.filter((h) => h.category === category));
    // here habits.filter utilizes a builtin func in JS to sort the categories
  }
}

/**
 * Synchronize preset category checkboxes with habits already saved by the user.
 * This keeps the categories page in sync with the backend.
 */
export async function syncCategoryPage() {
  try {
    const response = await fetch("/get-habits");
    const habits = await response.json();
    const names = habits.map((h) => h.habit_name);

    /* finds all checkboxes and checks if they are checked
     * if they are checked and is also present in the user's saved habits
     * strike them through and applies the checkbox
     */
    document.querySelectorAll("input[type='checkbox']").forEach((el) => {
      if (names.includes(el.dataset.name)) {
        el.checked = true;
        strikeHabit(el);
      }
    });
  } catch (err) {
    console.error("Error syncing categories:", err);
  }
}

/**
 * Initialize the habits page when it loads.
 */
export function initHabits() {
  loadHabits();
  loadStreak();
}

// Expose functions to the global window object so inline event handlers in the page can call them.
window.toggleHabit = toggleHabit;
window.deleteHabit = deleteHabit;
window.filterHabits = filterHabits;
window.togglePresetHabit = togglePresetHabit;
window.strikeHabit = strikeHabit;
window.unstrikeHabit = unstrikeHabit;
