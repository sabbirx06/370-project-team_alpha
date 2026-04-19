var habits = [];
var totalStreakPoints = 0;
var lastStreakDate = null;

function addHabit(habit) {
  var name = document.querySelector("#habit-name").value;
  var difficulty = document.querySelector("#difficulty-score").value;
  var difficulty_score = Number(difficulty);
  var id = Date.now(); // Needed for database uniqueness

  if (
    name === "" ||
    difficulty === "" ||
    difficulty_score < 1 ||
    difficulty_score > 10
  )
    return;

  habits.push({
    id,
    name,
    difficulty_score,
    lastCompleted: null,
  });

  document.querySelector("#habit-name").value = "";
  document.querySelector("#difficulty-score").value = "";
  renderHabits();
}

function renderHabits() {
  const today = new Date().toDateString();

  var list = document.querySelector("#habit-list");
  list.innerHTML = "";

  for (let i = 0; i < habits.length; i++) {
    const habit = habits[i];
    const isDone = habit.lastCompleted === today;

    list.innerHTML += `
  <div class="card mb-2 p-2 d-flex flex-row justify-content-between align-items-center fs-5">

    <!-- LEFT SIDE -->
    <div class="d-flex align-items-center gap-2">
      <input 
        type="checkbox"
        ${isDone ? "checked" : ""}
        onclick="toggleHabit(${habit.id})"
      />

      <span style="text-decoration:${isDone ? "line-through" : "none"}">
        ${habit.name}
      </span>
    </div>

    <!-- RIGHT SIDE -->
    <span class="badge badge-pill fs-5 text-dark">
      🔥 ${habit.difficulty_score}
    </span>

  </div>
`;
  }

  document.querySelector("#streak-points").innerText = "🔥" + totalStreakPoints;
}

function getPoints(difficulty) {
  return Math.round(difficulty * 1.618);
}

function allHabitsCompletedToday() {
  const today = new Date().toDateString();
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].lastCompleted != today) {
      return false;
    }
  }
  return habits.length > 0;
}

function updateStreak() {
  const today = new Date().toDateString();

  if (allHabitsCompletedToday()) {
    if (lastStreakDate !== today) {
      let dailyPoints = 0;

      for (let i = 0; i < habits.length; i++) {
        dailyPoints += getPoints(habits[i].difficulty_score);
      }

      totalStreakPoints += dailyPoints;
      lastStreakDate = today;
    }
  } else {
    // 🔥 reset if not all habits completed
    totalStreakPoints = 0;
    lastStreakDate = null;
  }
}

function toggleHabit(id) {
  const today = new Date().toDateString();

  for (let i = 0; i < habits.length; i++) {
    if (habits[i].id === id) {
      if (habits[i].lastCompleted === today) {
        habits[i].lastCompleted = null;
      } else {
        habits[i].lastCompleted = today;
      }
      break;
    }
  }

  updateStreak();
  renderHabits();
}

var monthlyBudget = 0;

function addBudget() {
  var amount = Number(document.querySelector("#budget-amount").value);

  if (amount <= 0) return;

  monthlyBudget = amount;

  localStorage.setItem("budget", monthlyBudget);

  document.querySelector("#monthly-budget").innerText = "৳ " + monthlyBudget;

  // hide form
  document.querySelector("#budget-form").style.display = "none";

  // show change button
  document.querySelector("#change-budget-btn").style.display = "block";
}

window.onload = function () {
  var saved = localStorage.getItem("budget");

  if (saved) {
    monthlyBudget = Number(saved);
    document.querySelector("#monthly-budget").innerText = "৳ " + monthlyBudget;
    updateBudgetUI();
    document.querySelector("#budget-form").style.display = "none";
    document.querySelector("#change-budget-btn").style.display = "block";
    updateBudgetUI();
  }
};

function resetBudget() {
  monthlyBudget = 0;
  localStorage.removeItem("budget");

  document.querySelector("#monthly-budget").innerText = "৳ 0";

  document.querySelector("#budget-form").style.display = "block";
  document.querySelector("#change-budget-btn").style.display = "none";
}

var expenses = [];
var totalExpense = 0;
function addExpense() {
  var name = document.querySelector("#expense-name").value;
  var amount = Number(document.querySelector("#expense-amount").value);

  if (name === "" || amount <= 0) return;

  expenses.push({
    id: Date.now(),
    name,
    amount,
  });

  document.querySelector("#expense-name").value = "";
  document.querySelector("#expense-amount").value = "";

  renderExpenses();
  updateBudgetUI();
}

function renderExpenses() {
  var list = document.querySelector("#expense-list");
  list.innerHTML = "";

  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];

    list.innerHTML += `
      <div class="card mb-2 p-2 d-flex flex-row justify-content-between align-items-center fs-5">

        <!-- LEFT -->
        <span>${expense.name}</span>

        <!-- RIGHT -->
        <div class="d-flex gap-2">
          <span class="badge badge-pill text-dark fs-5">৳ ${expense.amount}</span>

          <button 
            class="btn btn-sm btn-outline-danger"
            onclick="deleteExpense(${expense.id})"
          >
            ✕
          </button>
        </div>

      </div>
    `;
  }
}

function deleteExpense(id) {
  for (let i = 0; i < expenses.length; i++) {
    if (expenses[i].id === id) {
      expenses.splice(i, 1);
      break;
    }
  }

  renderExpenses();
  updateBudgetUI();
}

function getRemainingBudget() {
  let spent = 0;

  for (let i = 0; i < expenses.length; i++) {
    spent += expenses[i].amount;
  }

  return monthlyBudget - spent;
}

function updateBudgetUI() {
  var remaining = getRemainingBudget();
  var el = document.querySelector("#monthly-budget");

  el.innerText = "৳ " + remaining;

  if (remaining < 0) {
    el.style.color = "red";
  } else {
    el.style.color = "lightgreen";
  }
}

function updateHabitProgress() {
  const today = new Date().toDateString();

  let completed = 0;
  for (let i = 0; i < habits.length; i++) {
    if (habits[i].lastCompleted === today) {
      completed++;
    }
  }

  const total = habits.length;
  document.querySelector("#habit-progress").innerText = completed + "/" + total;
}

function updateDashboardBudget() {
  let spent = 0;
  for (let i = 0; i < expenses.length; i++) {
    spent += expenses[i].amount;
  }

  const remaining = monthlyBudget - spent;
  const elem = document.querySelector("#dashboard-budget");
  elem.innerText = "৳ " + remaining;

  if (remaining < 1000) {
    elem.style.color = "red";
  } else if (remaining > 1000 && remaining < 3000) {
    elem.style.color = "yellow";
  } else {
    elem.style.color = "green";
  }
}

window.onload = function () {
  updateHabitProgress();
  updateDashboardBudget();
};
