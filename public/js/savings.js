function loadSavings() {
  fetch("/savings-data")
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("goals-list");
      if (!list) return;

      list.innerHTML = "";

      if (data.length === 0) {
        list.innerHTML = `<p class="text-muted mt-2">No goals yet. Add one above!</p>`;
        return;
      }

      data.forEach((goal) => {
        const saved = goal.saved_amount || 0;
        const target = goal.target_amount;
        const percent = Math.min(Math.round((saved / target) * 100), 100);
        const circumference = 628;
        const offset = circumference - (percent / 100) * circumference;
        const isComplete = percent >= 100;
        const ringColor = isComplete ? "#28a745" : "#1e90d2";

        const li = document.createElement("li");
        li.classList.add("mb-3");

        li.innerHTML = `
          <div class="card p-3 d-flex flex-row align-items-center justify-content-between gap-4"
            style="background-color: rgba(255,255,255,0.06); border: 1px solid rgba(187,225,250,0.12); color: white;">

            <!-- LEFT: Info + Add Savings -->
            <div class="flex-grow-1">
              <div class="fs-5 fw-semibold mb-1">${goal.name}</div>
              <div style="color: rgba(187,225,250,0.6); font-size: 0.875rem;">
                ৳${saved} saved of ৳${target}
              </div>

              <form action="/add-saving" method="POST" class="d-flex gap-2 mt-3">
                <input type="hidden" name="goal_id" value="${goal.goal_id}" />
                <input
                  type="number"
                  name="amount"
                  class="form-control form-control-sm"
                  placeholder="Add amount (৳)"
                  min="1"
                  required
                  style="max-width: 180px;"
                />
                <button class="btn btn-sm btn-primary">Add</button>
              </form>
            </div>

            <!-- RIGHT: Progress Ring -->
            <div style="position: relative; width: 100px; height: 100px; flex-shrink: 0;">
              <svg width="100" height="100" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  stroke-width="10"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="${ringColor}"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="251"
                  stroke-dashoffset="${251 - (percent / 100) * 251}"
                  style="transition: stroke-dashoffset 1s ease;"
                />
              </svg>
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                <div style="font-size: 1.1rem; font-weight: 700; color: white;">${percent}%</div>
              </div>
            </div>

          </div>
        `;

        list.appendChild(li);
      });
    })
    .catch((err) => console.error("Error loading savings:", err));
}

window.onload = function () {
  loadSavings();
};
