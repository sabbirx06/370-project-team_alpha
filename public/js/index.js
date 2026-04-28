function getBudgetColor(remaining, total) {
  if (!total || total <= 0) return "lightgreen";

  const percent = (remaining / total) * 100;

  if (percent <= 10) return "red";
  if (percent <= 30) return "orange";
  return "lightgreen";
}

// ================= HABITS =================

function loadHabits() {
  fetch("/get-habits")
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("habit-list");
      list.innerHTML = "";

      data.forEach((habit) => {
        const li = document.createElement("li");
        li.classList.add(
          "list-group-item",
          "bg-transparent",
          "border-0",
          "px-0",
        );

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

<span class="badge rounded-pill bg-secondary">${habit.category}</span>

<div class="d-flex align-items-center gap-2">
  <span class="badge badge-pill fs-5 text-dark">🔥 ${habit.difficulty_score}</span>
  <button class="btn btn-sm btn-outline-danger" onclick="deleteHabit(${habit.habit_id})">✕</button>
</div>

          </div>
        `;

        list.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error loading habits:", err);
    });
}

function toggleHabit(id) {
  fetch("/toggle-habit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habit_id: id }),
  }).then(() => {
    loadHabits();
    loadStreak();
  });
}

function deleteHabit(id) {
  fetch("/delete-habit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ habit_id: id }),
  }).then(() => {
    loadHabits();
    loadStreak();
  });
}

// ================= EXPENSES =================

function loadExpenses() {
  fetch("/get-expenses")
    .then((res) => res.json())
    .then((data) => {
      const list = document.querySelector("#expense-list");
      if (!list) return;

      list.innerHTML = "";

      data.forEach((expense) => {
        const li = document.createElement("li");
        li.classList.add(
          "list-group-item",
          "bg-transparent",
          "border-0",
          "px-0",
        );

        li.innerHTML = `
          <div class="card mb-2 p-2 d-flex flex-row justify-content-between align-items-center fs-5">

            <span>${expense.description}</span>

            <div class="d-flex gap-2 align-items-center">
              <span class="badge badge-pill text-dark fs-5">৳ ${expense.amount}</span>
              <button
                class="btn btn-sm btn-outline-danger"
                onclick="deleteExpense(${expense.expense_id})"
              >✕</button>
            </div>

          </div>
        `;

        list.appendChild(li);
      });
    });
}

function deleteExpense(id) {
  fetch("/delete-expense", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expense_id: id }),
  }).then(() => {
    loadExpenses();
    loadRemainingBudget();
  });
}

// ================= BUDGET =================

function loadRemainingBudget() {
  fetch("/remaining-budget")
    .then((res) => res.json())
    .then((data) => {
      const el1 = document.querySelector("#monthly-budget"); // expenses page
      const el2 = document.querySelector("#dashboard-budget"); // dashboard page
      const warningEl = document.querySelector("#budget-warning");

      const total = data.totalBudget || 0;
      const remaining = data.remaining || 0;

      const color = getBudgetColor(remaining, total);
      const bar = document.querySelector("#budget-bar");

      if (bar && total > 0) {
        let percent = (remaining / total) * 100;

        percent = Math.max(0, Math.min(percent, 100)); // clamp

        bar.style.width = percent + "%";

        if (percent <= 10) bar.className = "progress-bar bg-danger";
        else if (percent <= 30) bar.className = "progress-bar bg-warning";
        else bar.className = "progress-bar bg-success";
      }

      // ===== UPDATE TEXT + COLOR =====
      if (el1) {
        el1.innerText = "৳ " + remaining;
        el1.style.color = color;
      }

      if (el2) {
        el2.innerText = "৳ " + remaining;
        el2.style.color = color;
      }

      // ===== WARNING BAR =====

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

      // ===== FORM TOGGLE (expenses page only) =====
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
    })
    .catch((err) => console.error("Budget load error:", err));
}
// ================= STREAK =================

function loadStreak() {
  fetch("/streak")
    .then((res) => res.json())
    .then((data) => {
      const el = document.getElementById("streak-points");
      if (el) el.innerText = "🔥 " + data.streak;
    });
}

// ================= DASHBOARD =================

function loadDashboard() {
  fetch("/dashboard-data")
    .then((res) => res.json())
    .then((data) => {
      // ===== HABIT PROGRESS =====
      const progress = document.querySelector("#habit-progress");
      if (progress) {
        progress.innerText = data.completed + "/" + data.totalHabits;
      }

      // ===== BUDGET =====
      const budget = document.querySelector("#dashboard-budget");
      if (budget) {
        budget.innerText = "৳ " + data.remaining;
        budget.style.color = getBudgetColor(data.remaining, data.totalBudget);
      }
    })
    .catch((err) => console.error("Dashboard error:", err));
}
// ================= LEADERBOARD =================

function loadLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;

  fetch("/get-leaderboard")
    .then((res) => res.json())
    .then((data) => {
      list.innerHTML = "";

      if (data.leaderboard.length === 0) {
        list.innerHTML = `<li class="text-center text-muted py-4">No data yet. Complete some habits to appear here!</li>`;
        return;
      }

      const medals = ["🥇", "🥈", "🥉"];

      data.leaderboard.forEach((user, index) => {
        const isCurrentUser = user.user_id === data.currentUserId;
        const rank = index + 1;
        const medal = medals[index] || `#${rank}`;

        const li = document.createElement("li");
        li.classList.add(
          "list-group-item",
          "bg-transparent",
          "border-0",
          "px-0",
        );

        li.innerHTML = `
          <div class="card mb-2 p-3 d-flex flex-row align-items-center justify-content-between gap-3"
            style="${isCurrentUser ? "border: 2px solid #0d6efd;" : ""}">

            <div class="d-flex align-items-center gap-3">
              <span class="fs-4">${medal}</span>
              <span class="fs-5 ${isCurrentUser ? "fw-bold" : ""}">
                ${user.name}${isCurrentUser ? " (you)" : ""}
              </span>
            </div>

            <span class="badge bg-primary fs-6">🔥 ${user.streak_points} pts</span>

          </div>
        `;

        list.appendChild(li);
      });
    })
    .catch((err) => console.error("Error loading leaderboard:", err));
}

// added
let allHabits = [];
function loadHabits() {
  fetch("/get-habits")
    .then((res) => res.json())
    .then((data) => {
      allHabits = data;
      renderHabits(data);
    });
}
function renderHabits(data) {
  const list = document.getElementById("habit-list");
  list.innerHTML = "";

  data.forEach((habit) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "bg-transparent", "border-0", "px-0");

    li.innerHTML = `
      <div class="card mb-2 p-3 d-flex flex-row align-items-center justify-content-between">

        <div class="d-flex align-items-center gap-2">
          <input type="checkbox"
            ${habit.completed ? "checked" : ""}
            onchange="toggleHabit(${habit.habit_id})"
          />
          <span style="${habit.completed ? "text-decoration: line-through;" : ""}">
            ${habit.habit_name}
          </span>
        </div>

        <span class="badge bg-secondary">${habit.category}</span>

        <div class="d-flex gap-2">
          <span>🔥 ${habit.difficulty_score}</span>
        </div>
      </div>
    `;

    list.appendChild(li);
  });
}

function strikeHabit(el) {
  const text = el.nextElementSibling;
  text.style.textDecoration = "line-through";
  text.style.opacity = "0.5";
}

function unstrikeHabit(el) {
  const text = el.nextElementSibling;
  text.style.textDecoration = "none";
  text.style.opacity = "1";
}
function togglePresetHabit(el) {
  const name = el.dataset.name;
  const difficulty = el.dataset.difficulty;
  const category = el.dataset.category;

  if (el.checked) {
    // ADD
    fetch("/add-habit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, difficulty, category }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        strikeHabit(el);
      })
      .catch(() => {
        el.checked = false;
      });
  } else {
    // REMOVE
    fetch("/delete-habit-by-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    }).then(() => unstrikeHabit(el));
  }
}

function filterHabits(category) {
  if (category === "all") {
    renderHabits(allHabits);
  } else {
    const filtered = allHabits.filter((h) => h.category === category);
    renderHabits(filtered);
  }
}

function addExpense(e) {
  e.preventDefault();

  const name = document.querySelector('[name="name"]').value;
  const amount = document.querySelector('[name="amount"]').value;

  fetch("/add-expense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, amount }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error); // simple + effective
        return;
      }

      loadExpenses();
      loadRemainingBudget();
    });
}

function syncCategoryPage() {
  fetch("/get-habits")
    .then((res) => res.json())
    .then((habits) => {
      const names = habits.map((h) => h.habit_name);

      document.querySelectorAll("input[type='checkbox']").forEach((el) => {
        if (names.includes(el.dataset.name)) {
          el.checked = true;
          strikeHabit(el);
        }
      });
    });
}

// ================= INIT =================

window.onload = function () {
  loadHabits();
  loadStreak();
  loadExpenses();
  loadRemainingBudget();
  loadDashboard();
  loadLeaderboard();
  syncCategoryPage();
};
