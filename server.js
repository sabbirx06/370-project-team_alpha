// Habitcents - A habit tracking web application
// This is the main server file that handles all the backend logic

const express = require("express"); // Web framework for Node.js
const path = require("path"); // Node.js utility for working with file paths
const db = require("./db"); // Database connection and queries
const session = require("express-session"); // Session management for user authentication

const app = express(); // Create the Express application
const PORT = process.env.PORT || 3000; // Port number where the server will run

// Preset habits data - predefined habits users can quickly add to their tracking
// Each habit has a name, difficulty level (1-10), and some have custom display names
const presetHabits = {
  physical: [
    // Exercise and fitness related habits
    { name: "Walking 10,000 Steps", difficulty: 5 },
    { name: "Going to the gym", difficulty: 7 },
    { name: "Playing football", difficulty: 6 },
  ],
  spiritual: [
    // Mindfulness and spiritual habits
    { name: "Meditation", difficulty: 4 },
    { name: "Prayer", difficulty: 3 },
    { name: "Gratitude Journal", difficulty: 5 },
  ],
  healthy: [
    // Health and wellness habits
    { name: "Drinking Water", difficulty: 2 },
    { name: "Sleep Early", displayName: "Going to sleep early", difficulty: 6 }, // Shows custom display text
    { name: "Eating Healthy", difficulty: 5 },
  ],
};

// Middleware setup - these run on every request
app.use(express.urlencoded({ extended: true })); // Parse form data from POST requests
app.use(express.json()); // Parse JSON data from AJAX requests
app.use(express.static(path.join(__dirname, "public"))); // Serve static files (CSS, JS, images)
app.set("view engine", "ejs"); // Set EJS as the template engine for rendering HTML

// Session configuration - manages user login state across requests
app.use(
  session({
    secret: "secret-key", // Used to sign session cookies (should be a strong secret in production)
    resave: false, // Don't save session if it wasn't modified
    saveUninitialized: true, // Create session even if nothing is stored
  }),
);

// Middleware function to protect routes that require login
function requireLogin(req, res, next) {
  if (!req.session.user) {
    // If user is not logged in, redirect to login page with error message
    return res.redirect("/login?error=Please login first");
  }
  next(); // Continue to the next middleware/route handler
}

// Helper function for protected page routes - reduces code duplication
function renderProtectedPage(pageName) {
  return (req, res) => {
    // Render the specified page template with the page name for navigation highlighting
    res.render(pageName, { page: pageName });
  };
}

// ================= PAGE ROUTES =================
// These handle displaying different pages of the application

app.get("/", (req, res) => {
  // Landing page - shown to visitors who aren't logged in
  res.render("index");
});

app.get("/login", (req, res) => {
  // Login page - if user is already logged in, redirect to dashboard
  if (req.session.user) return res.redirect("/dashboard");
  res.render("login", { query: req.query }); // Pass URL query parameters for error messages
});

app.get("/signup", (req, res) => {
  // Signup page - if user is already logged in, redirect to dashboard
  if (req.session.user) return res.redirect("/dashboard");
  res.render("signup", { query: req.query }); // Pass URL query parameters for error messages
});

app.get("/dashboard", requireLogin, (req, res) => {
  // Main dashboard - requires login, shows user overview
  res.render("dashboard", { user: req.session.user, page: "dashboard" });
});

// Protected routes using the helper function - all require login
app.get("/habits", requireLogin, renderProtectedPage("habits")); // Habit tracking page
app.get("/expenses", requireLogin, renderProtectedPage("expenses")); // Expense tracking page
app.get("/leaderboard", requireLogin, renderProtectedPage("leaderboard")); // User rankings page
app.get("/savings", requireLogin, renderProtectedPage("savings")); // Savings goals page

app.get("/categories", requireLogin, (req, res) => {
  // Categories page - shows preset habits users can quickly add
  res.render("categories", { page: "categories", presetHabits });
});

// ================= AUTHENTICATION ROUTES =================
// These handle user registration and login

app.post("/signup", (req, res) => {
  // Handle user registration (object destructuring)
  const { name, email, password } = req.body; // Get form data from signup form

  // Check if email already exists in database
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (result.length > 0) {
      // Email already taken, redirect back with error
      return res.redirect("/signup?error=Email already exists");
    }

    // Create new user account
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      (err) => {
        if (err) {
          // Database error during signup
          return res.redirect("/signup?error=Signup failed");
        }
        // Success - redirect to login with success message
        res.redirect("/login?success=Account created successfully");
      },
    );
  });
});

app.post("/login", (req, res) => {
  // Handle user login
  const { email, password } = req.body; // Get form data from login form

  // Find user by email in database
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (result.length === 0) {
      // No user found with this email
      return res.redirect("/login?error=User not found");
    }

    const user = result[0]; // Get the user data

    if (user.password !== password) {
      // Password doesn't match
      return res.redirect("/login?error=Incorrect password");
    }

    // Login successful - store user in session and redirect to dashboard
    req.session.user = user;
    res.redirect("/dashboard");
  });
});

// ================= HABITS API ROUTES =================
// These handle requests for habits management

app.post("/add-habit", requireLogin, (req, res) => {
  // Add a new habit for the logged-in user
  const { name, difficulty, category } = req.body; // Habit data from form/AJAX
  const user_id = req.session.user.user_id; // Get user ID from session
  const habit_id = Date.now(); // Use timestamp as unique habit ID

  const difficulty_score = Number(difficulty);
  if (difficulty_score < 1 || difficulty_score > 10) {
    // Validate difficulty is between 1-10
    return res.redirect("/habits");
  }

  // Insert new habit into database
  db.query(
    "INSERT INTO habits (habit_id, user_id, habit_name, difficulty_score, category) VALUES (?, ?, ?, ?, ?)",
    [habit_id, user_id, name, difficulty_score, category],
    (err) => {
      if (err) {
        console.error(err);
        return res.redirect("/habits");
      }
      res.redirect("/habits"); // Redirect back to habits page
    },
  );
});

app.get("/get-habits", requireLogin, (req, res) => {
  // Get all habits for the logged-in user
  const user_id = req.session.user.user_id;

  // Complex query that joins habits with today's log to check completion status
  db.query(
    `SELECT h.*, 
       CASE WHEN hl.habit_id IS NOT NULL THEN 1 ELSE 0 END AS completed
        FROM habits h
        LEFT JOIN habit_logs hl 
        ON h.habit_id = hl.habit_id 
        AND hl.date = CURDATE()
        WHERE h.user_id = ?`,
    [user_id],
    (err, result) => {
      res.json(result); // Return habits as JSON for frontend JavaScript
    },
  );
});

app.post("/toggle-habit", requireLogin, (req, res) => {
  // Mark habit as completed/uncompleted for today
  const { habit_id } = req.body;
  const today = new Date().toLocaleDateString("en-CA"); // Get today's date in YYYY-MM-DD format

  // Check if habit was already completed today
  db.query(
    "SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?",
    [habit_id, today],
    (err, result) => {
      if (result.length > 0) {
        // Habit was completed - remove the log entry (uncheck)
        db.query(
          "DELETE FROM habit_logs WHERE habit_id = ? AND date = ?",
          [habit_id, today],
          () => res.send("unchecked"),
        );
      } else {
        // Habit not completed - add log entry (check)
        db.query(
          "INSERT INTO habit_logs (habit_id, date, completed_status) VALUES (?, ?, 1)",
          [habit_id, today],
          () => res.send("checked"),
        );
      }
    },
  );
});

app.post("/delete-habit", requireLogin, (req, res) => {
  // Delete a habit and all its log entries
  const { habit_id } = req.body;
  const user_id = req.session.user.user_id;

  // First delete all log entries for this habit
  db.query("DELETE FROM habit_logs WHERE habit_id = ?", [habit_id], () => {
    // Then delete the habit itself
    db.query(
      "DELETE FROM habits WHERE habit_id = ? AND user_id = ?",
      [habit_id, user_id],
      (err) => {
        if (err) return res.status(500).json({ error: "Delete failed" });
        res.json({ success: true });
      },
    );
  });
});

app.get("/reset-habits", requireLogin, (req, res) => {
  // Reset all habits - delete all habits and their logs for the user
  const user_id = req.session.user.user_id;

  // Delete all habit logs for user's habits
  db.query(
    "DELETE hl FROM habit_logs hl JOIN habits h ON hl.habit_id = h.habit_id WHERE h.user_id = ?",
    [user_id],
    () => {
      // Then delete all habits for the user
      db.query("DELETE FROM habits WHERE user_id = ?", [user_id], () =>
        res.redirect("/habits"),
      );
    },
  );
});

app.get("/streak", requireLogin, (req, res) => {
  // Calculate today's streak points (sum of difficulty scores of completed habits)
  const user_id = req.session.user.user_id;

  // Gets the sum of all the difficulty score in the habit_log table + habit table
  db.query(
    `SELECT SUM(h.difficulty_score) AS streak
     FROM habit_logs hl
     JOIN habits h ON hl.habit_id = h.habit_id
     WHERE h.user_id = ? AND hl.date = CURDATE()`,
    [user_id],
    (err, result) => {
      const streak = result[0].streak || 0; // Default to 0 if no habits completed
      res.json({ streak });
    },
  );
});

// ================= EXPENSES/BUDGET API ROUTES =================
// These handle budget setting and expense tracking

app.post("/set-budget", requireLogin, (req, res) => {
  // Set monthly budget for the current month
  const { amount } = req.body;
  const user_id = req.session.user.user_id;

  const month = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  const year = new Date().getFullYear();

  // Delete existing budget for this month/year, then insert new one
  db.query(
    "DELETE FROM budgets WHERE user_id = ? AND month = ? AND year = ?",
    [user_id, month, year],
    () => {
      db.query(
        "INSERT INTO budgets (user_id, total_budget, month, year) VALUES (?, ?, ?, ?)",
        [user_id, amount, month, year],
        () => res.redirect("/expenses"),
      );
    },
  );
});

app.get("/get-budget", requireLogin, (req, res) => {
  // Get current month's budget
  const user_id = req.session.user.user_id;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  db.query(
    "SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ?",
    [user_id, month, year],
    (err, result) => {
      if (result.length === 0) return res.json({ total_budget: 0 });
      res.json(result[0]);
    },
  );
});

app.get("/reset-budget", requireLogin, (req, res) => {
  // Delete current month's budget
  const user_id = req.session.user.user_id;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  db.query(
    "DELETE FROM budgets WHERE user_id = ? AND month = ? AND year = ?",
    [user_id, month, year],
    () => res.redirect("/expenses"),
  );
});

app.get("/remaining-budget", requireLogin, (req, res) => {
  // Calculate remaining budget (total budget minus sum of expenses)
  const user_id = req.session.user.user_id;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  // First get the budget amount
  db.query(
    `SELECT total_budget 
     FROM budgets 
     WHERE user_id = ? AND month = ? AND year = ?
     ORDER BY budget_id DESC 
     LIMIT 1`,
    [user_id, month, year],
    (err, budgetRes) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (budgetRes.length === 0)
        return res.json({
          remaining: 0,
          totalBudget: 0,
          hasBudget: false,
        });
      const total = budgetRes[0].total_budget;

      // Then get total expenses for the month
      db.query(
        `SELECT SUM(amount) AS total_expense 
         FROM expenses 
         WHERE user_id = ? 
         AND MONTH(date) = ? 
         AND YEAR(date) = ?`,
        [user_id, month, year],
        (err2, expenseRes) => {
          if (err2) return res.status(500).json({ error: "Database error" });

          const spent = expenseRes[0].total_expense || 0;
          const remaining = total - spent;

          res.json({
            remaining,
            totalBudget: total,
            hasBudget: true,
          });
        },
      );
    },
  );
});

app.post("/add-expense", requireLogin, (req, res) => {
  // Add a new expense entry
  const { name } = req.body;
  const amount = parseFloat(req.body.amount);

  const user_id = req.session.user.user_id;
  const today = new Date().toLocaleDateString("en-CA"); // Today's date in YYYY-MM-DD format

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  // Basic validation - ensure name and valid amount
  if (!name || isNaN(amount)) {
    return res.redirect("/expenses");
  }

  // Get the current month's budget to link the expense to it
  db.query(
    "SELECT * FROM budgets WHERE user_id = ? AND month = ? AND year = ? ORDER BY budget_id DESC LIMIT 1",
    [user_id, month, year],
    (err, result) => {
      if (err) {
        console.error("BUDGET FETCH ERROR:", err);
        return res.redirect("/expenses");
      }

      if (result.length === 0) {
        // No budget set for this month
        return res.redirect("/expenses");
      }

      const budget_id = result[0].budget_id;

      // Insert the expense linked to the budget
      db.query(
        "INSERT INTO expenses (user_id, budget_id, date, description, amount) VALUES (?, ?, ?, ?, ?)",
        [user_id, budget_id, today, name, amount],
        (err) => {
          if (err) {
            console.error("INSERT ERROR:", err);
            return res.send("Database error");
          }
          res.redirect("/expenses");
        },
      );
    },
  );
});

app.get("/get-expenses", requireLogin, (req, res) => {
  // Get all expenses for the user (used by AJAX to load expenses list)
  const user_id = req.session.user.user_id;

  db.query(
    "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC",
    [user_id],
    (err, result) => {
      res.json(result); // Return expenses as JSON
    },
  );
});

app.post("/delete-expense", requireLogin, (req, res) => {
  // Delete an expense entry
  const { expense_id } = req.body;
  const user_id = req.session.user.user_id;

  db.query(
    "DELETE FROM expenses WHERE expense_id = ? AND user_id = ?",
    [expense_id, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Delete failed" });
      res.json({ success: true });
    },
  );
});

app.get("/dashboard-data", requireLogin, (req, res) => {
  // Get dashboard statistics (total habits, completed today, budget remaining)
  const user_id = req.session.user.user_id;
  const today = new Date().toLocaleDateString("en-CA");
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  // Get total number of habits
  db.query(
    "SELECT COUNT(*) AS total FROM habits WHERE user_id = ?",
    [user_id],
    (err, habitRes) => {
      const totalHabits = habitRes[0].total;

      // Get number of habits completed today
      db.query(
        `SELECT COUNT(*) AS completed 
         FROM habit_logs hl
         JOIN habits h ON hl.habit_id = h.habit_id
         WHERE h.user_id = ? AND hl.date = ?`,
        [user_id, today],
        (err, logRes) => {
          const completed = logRes[0].completed;

          // Get current month's budget
          db.query(
            "SELECT total_budget FROM budgets WHERE user_id = ? AND month = ? AND year = ?",
            [user_id, month, year],
            (err, budgetRes) => {
              let total = 0;
              if (budgetRes.length > 0) total = budgetRes[0].total_budget;

              // Get total expenses for the month
              db.query(
                "SELECT SUM(amount) AS spent FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?",
                [user_id, month, year],
                (err, expenseRes) => {
                  const spent = expenseRes[0].spent || 0;
                  const remaining = total - spent;

                  res.json({
                    totalHabits,
                    completed,
                    remaining,
                    totalBudget: total,
                  });
                },
              );
            },
          );
        },
      );
    },
  );
});

// ================= LEADERBOARD =================

app.get("/get-leaderboard", requireLogin, (req, res) => {
  // Get top 20 users by today's streak points for leaderboard
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  db.query(
    `SELECT u.name, u.user_id,
       COALESCE(SUM(h.difficulty_score), 0) AS streak_points
     FROM users u
     LEFT JOIN habits h ON h.user_id = u.user_id
     LEFT JOIN habit_logs hl ON hl.habit_id = h.habit_id AND hl.date = CURDATE()
     GROUP BY u.user_id, u.name
     ORDER BY streak_points DESC
     LIMIT 20`,
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json({
        leaderboard: result,
        currentUserId: req.session.user.user_id, // To highlight current user
      });
    },
  );
});

// ================= SAVINGS GOALS =================

app.post("/add-goal", requireLogin, (req, res) => {
  // Create a new savings goal
  const user_id = req.session.user.user_id;
  const { name, target } = req.body;

  db.query(
    "INSERT INTO savings_goals (user_id, name, target_amount) VALUES (?, ?, ?)",
    [user_id, name, target],
    () => res.redirect("/savings"),
  );
});

app.get("/savings-data", requireLogin, (req, res) => {
  // Get all savings goals for the user
  const user_id = req.session.user.user_id;

  db.query(
    "SELECT * FROM savings_goals WHERE user_id = ?",
    [user_id],
    (err, results) => res.json(results),
  );
});

app.post("/add-saving", requireLogin, (req, res) => {
  // Add money to a savings goal
  const user_id = req.session.user.user_id;
  const { goal_id, amount } = req.body;

  db.query(
    "UPDATE savings_goals SET saved_amount = COALESCE(saved_amount, 0) + ? WHERE goal_id = ? AND user_id = ?",
    [amount, goal_id, user_id],
    (err) => {
      if (err) return res.send("Error updating savings");
      res.redirect("/savings");
    },
  );
});

app.get("/logout", (req, res) => {
  // Destroy user session and redirect to login
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.redirect("/login?success=Logged out successfully");
  });
});

// ================= SERVER STARTUP =================

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
