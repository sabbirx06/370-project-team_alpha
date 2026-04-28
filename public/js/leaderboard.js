// Leaderboard page logic: shows top users by daily habit streak points.

export async function loadLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;

  try {
    const response = await fetch("/get-leaderboard");
    const data = await response.json();

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
      li.classList.add("list-group-item", "bg-transparent", "border-0", "px-0");

      li.innerHTML = `
        <div class="card mb-2 p-3 d-flex flex-row align-items-center justify-content-between gap-3" style="${isCurrentUser ? "border: 2px solid #0d6efd;" : ""}">
          <div class="d-flex align-items-center gap-3">
            <span class="fs-4">${medal}</span>
            <span class="fs-5 ${isCurrentUser ? "fw-bold" : ""}">${user.name}${isCurrentUser ? " (you)" : ""}</span>
          </div>
          <span class="badge bg-primary fs-6">🔥 ${user.streak_points} pts</span>
        </div>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

/**
 * Initialize the leaderboard page.
 */
export function initLeaderboard() {
  loadLeaderboard();
}
