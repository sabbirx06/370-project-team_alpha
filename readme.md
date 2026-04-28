# HabitCents – Habit & Expense Tracker

HabitCents is a productivity application that helps users build positive habits while managing their day-to-day finances. The system allows users to track daily habit completion, maintain streaks based on habit difficulty, and monitor monthly expenses against a predefined budget.

HabitCents is a productivity platform that helps users build their positive habits while also contributing in managing their day-to-day financial expenses. The platform allows users to track daily habit completion, maintain streaks based on them and also monitor their personal expenses along with tons of other features as well.

---

## Features

#### Create Habits with Difficulty Scoring

Users can create habits and assign a **difficulty score (0–9)**.

- **0** → Easiest habit
- **9** → Most difficult habit

Difficulty scoring determines the **streak points** awarded when a habit is completed. Habits with lower difficulty scores have a lower streak point while habits with higher difficulty score has a higher streak point.

---

#### Mark Habit Completion

Users can mark a habit as **completed for the day**, allowing the system to track daily progress.

---

#### Habit Streak Calculation

The system automatically calculates **habit streaks** based on daily completion.

Users earn **streak points** depending on the difficulty score of the habit.

---

#### Habit Categorization

Habits can be organized into different categories.

Example categories include:

- **Spiritual**
  - Praying Jummah
  - Weekly fasting

- **Physical**
  - Walking 10,000 steps
  - Exercising

- **Bad Habits**
  - Reducing smoking
  - Limiting social media use

- **Nutrition**
  - Calorie tracking
  - Eating balanced meals

---

#### Set Monthly Budget

Users can define a **monthly budget** at the beginning of each month.

---

#### Expense Tracking

Users can manage expenses through full **CRUD operations**:

- Add new expenses
- Edit existing expenses
- Delete expenses

---

#### Savings Calculation

At the end of the month, the system calculates the **remaining balance** from the monthly budget.

Users can allocate the saved money to different **savings goals**, such as:

- Buying a laptop
- Purchasing a camera
- Saving for a vacation

---

#### Overexpenditure Detection

If a user exceeds the allocated monthly budget, the system generates an **overexpenditure alert**.

---

#### Leaderboard

A leaderboard ranks users based on their **highest habit streaks**, encouraging motivation and consistency.

---

## Technology Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Database | MySQL                 |
| Backend  | PHP / Node.js         |
| Frontend | HTML, CSS, JavaScript |


--- 

## EER Diagram

<img width="1604" height="789" alt="673518321_2416310138889516_1682432696686418862_n" src="https://github.com/user-attachments/assets/63109443-eb0f-4bc3-9bd7-b52e37fffada" />



--- 

## Normalised Schema Diagram

<img width="1198" height="641" alt="672478732_2003272990395281_3361666801120849104_n" src="https://github.com/user-attachments/assets/89752bfc-e074-4099-8b61-eadab2a0a9cb" />
