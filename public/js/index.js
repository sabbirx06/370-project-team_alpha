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
      const el1 = document.querySelector("#monthly-budget");
      const el2 = document.querySelector("#dashboard-budget");

      if (el1) {
        el1.innerText = "৳ " + data.remaining;
        el1.style.color = data.remaining < 0 ? "red" : "lightgreen";
      }
      if (el2) {
        el2.innerText = "৳ " + data.remaining;
        if (data.remaining < 1000) {
          el2.style.color = "red";
        } else if (data.remaining < 3000) {
          el2.style.color = "yellow";
        } else {
          el2.style.color = "lightgreen";
        }
      }

      // Show/hide budget form and action buttons on expenses page
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
    });
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
      const progress = document.querySelector("#habit-progress");
      if (progress) {
        progress.innerText = data.completed + "/" + data.totalHabits;
      }

      const budget = document.querySelector("#dashboard-budget");
      if (budget) {
        budget.innerText = "৳ " + data.remaining;
        if (data.remaining < 1000) {
          budget.style.color = "red";
        } else if (data.remaining < 3000) {
          budget.style.color = "yellow";
        } else {
          budget.style.color = "lightgreen";
        }
      }
    });
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

// ================= INIT =================

window.onload = function () {
  loadHabits();
  loadStreak();
  loadExpenses();
  loadRemainingBudget();
  loadDashboard();
  loadLeaderboard();
};
