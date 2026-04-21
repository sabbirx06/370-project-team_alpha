const express = require("express");
const path = require("path");
const db = require("./db");
const session = require("express-session");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  }),
);

// ================= PAGE ROUTES =================

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("dashboard", { user: req.session.user });
});

app.get("/habits", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("habits");
});

app.get("/expenses", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("expenses");
});

app.get("/leaderboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("leaderboard");
});

// ================= AUTH =================

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, password],
    (err) => {
      if (err) return res.send("Signup failed!");
      res.redirect("/login");
    },
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (result.length === 0) return res.send("User not found");

    const user = result[0];
    if (user.password !== password) {
      return res.send("Wrong password!");
    }
    req.session.user = user;
    res.redirect("/dashboard");
  });
});

// ================= HABITS =================

app.post("/add-habit", (req, res) => {
  const { name, difficulty, category } = req.body;
  const user_id = req.session.user.user_id;
  const habit_id = Date.now();

  const difficulty_score = Number(difficulty);
  if (difficulty_score < 1 || difficulty_score > 10) {
    return res.send("Difficulty must be between 1 and 10.");
  }

  db.query(
    "INSERT INTO habits (habit_id, user_id, habit_name, difficulty_score, category) VALUES (?, ?, ?, ?, ?)",
    [habit_id, user_id, name, difficulty_score, category],
    (err) => {
      if (err) return res.send("Error adding habit");
      res.redirect("/habits");
    },
  );
});

app.get("/get-habits", (req, res) => {
  const user_id = req.session.user.user_id;

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
      res.json(result);
    },
  );
});

app.post("/toggle-habit", (req, res) => {
  const { habit_id } = req.body;
  const today = new Date().toLocaleDateString("en-CA");

  db.query(
    "SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?",
    [habit_id, today],
    (err, result) => {
      if (result.length > 0) {
        db.query(
          "DELETE FROM habit_logs WHERE habit_id = ? AND date = ?",
          [habit_id, today],
          () => res.send("unchecked"),
        );
      } else {
        db.query(
          "INSERT INTO habit_logs (habit_id, date, completed_status) VALUES (?, ?, 1)",
          [habit_id, today],
          () => res.send("checked"),
        );
      }
    },
  );
});

app.post("/delete-habit", (req, res) => {
  const { habit_id } = req.body;
  const user_id = req.session.user.user_id;

  db.query("DELETE FROM habit_logs WHERE habit_id = ?", [habit_id], () => {
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

app.get("/reset-habits", (req, res) => {
  const user_id = req.session.user.user_id;

  db.query(
    "DELETE hl FROM habit_logs hl JOIN habits h ON hl.habit_id = h.habit_id WHERE h.user_id = ?",
    [user_id],
    () => {
      db.query("DELETE FROM habits WHERE user_id = ?", [user_id], () =>
        res.redirect("/habits"),
      );
    },
  );
});

app.get("/streak", (req, res) => {
  const user_id = req.session.user.user_id;

  db.query(
    `SELECT SUM(h.difficulty_score) AS streak
     FROM habit_logs hl
     JOIN habits h ON hl.habit_id = h.habit_id
     WHERE h.user_id = ? AND hl.date = CURDATE()`,
    [user_id],
    (err, result) => {
      const streak = result[0].streak || 0;
      res.json({ streak });
    },
  );
});

// ================= BUDGET =================

app.post("/set-budget", (req, res) => {
  const { amount } = req.body;
  const user_id = req.session.user.user_id;

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

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

app.get("/get-budget", (req, res) => {
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

app.get("/reset-budget", (req, res) => {
  const user_id = req.session.user.user_id;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  db.query(
    "DELETE FROM budgets WHERE user_id = ? AND month = ? AND year = ?",
    [user_id, month, year],
    () => res.redirect("/expenses"),
  );
});

app.get("/remaining-budget", (req, res) => {
  const user_id = req.session.user.user_id;

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

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
        return res.json({ remaining: 0, hasBudget: false });

      const total = budgetRes[0].total_budget;

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

          res.json({ remaining, hasBudget: true });
        },
      );
    },
  );
});

// ================= EXPENSES =================

app.post("/add-expense", (req, res) => {
  const { name, amount } = req.body;
  const user_id = req.session.user.user_id;
  const today = new Date().toLocaleDateString("en-CA");

  db.query(
    "SELECT * FROM budgets WHERE user_id = ? ORDER BY budget_id DESC LIMIT 1",
    [user_id],
    (err, result) => {
      if (result.length === 0) return res.send("Set budget first");

      const budget_id = result[0].budget_id;

      db.query(
        "INSERT INTO expenses (user_id, budget_id, date, description, amount) VALUES (?, ?, ?, ?, ?)",
        [user_id, budget_id, today, name, amount],
        () => res.redirect("/expenses"),
      );
    },
  );
});

app.get("/get-expenses", (req, res) => {
  const user_id = req.session.user.user_id;

  db.query(
    "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC",
    [user_id],
    (err, result) => {
      res.json(result);
    },
  );
});

app.post("/delete-expense", (req, res) => {
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

// ================= DASHBOARD =================

app.get("/dashboard-data", (req, res) => {
  const user_id = req.session.user.user_id;
  const today = new Date().toLocaleDateString("en-CA");

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  db.query(
    "SELECT COUNT(*) AS total FROM habits WHERE user_id = ?",
    [user_id],
    (err, habitRes) => {
      const totalHabits = habitRes[0].total;

      db.query(
        `SELECT COUNT(*) AS completed 
         FROM habit_logs hl
         JOIN habits h ON hl.habit_id = h.habit_id
         WHERE h.user_id = ? AND hl.date = ?`,
        [user_id, today],
        (err, logRes) => {
          const completed = logRes[0].completed;

          db.query(
            "SELECT total_budget FROM budgets WHERE user_id = ? AND month = ? AND year = ?",
            [user_id, month, year],
            (err, budgetRes) => {
              let total = 0;
              if (budgetRes.length > 0) total = budgetRes[0].total_budget;

              db.query(
                "SELECT SUM(amount) AS spent FROM expenses WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?",
                [user_id, month, year],
                (err, expenseRes) => {
                  const spent = expenseRes[0].spent || 0;
                  const remaining = total - spent;

                  res.json({ totalHabits, completed, remaining });
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

app.get("/get-leaderboard", (req, res) => {
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
        currentUserId: req.session.user.user_id,
      });
    },
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
