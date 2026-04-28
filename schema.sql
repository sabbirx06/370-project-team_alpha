-- =============================================
-- HABITCENTS DATABASE SCHEMA
-- =============================================

-- Drop database if it exists
DROP DATABASE IF EXISTS habitcents;

-- Create fresh database
CREATE DATABASE habitcents;
USE habitcents;

-- =============================================
-- TABLE: users
-- Stores user account information and streaks
-- =============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    age INT,
    current_streak INT DEFAULT 0,
    highest_streak INT DEFAULT 0
);

-- =============================================
-- TABLE: habits
-- Main habits table with difficulty scoring
-- =============================================
CREATE TABLE habits (
    habit_id BIGINT PRIMARY KEY,
    user_id INT,
    habit_name VARCHAR(255),
    difficulty_score INT,
    category VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: habit_logs
-- Daily tracking of habit completion
-- =============================================
CREATE TABLE habit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id BIGINT,
    date DATE,
    completed_status BOOLEAN,
    streak_points_earned INT,
    FOREIGN KEY (habit_id) REFERENCES habits(habit_id) ON DELETE CASCADE,
    UNIQUE (habit_id, date)
);

-- =============================================
-- TABLE: physical_habits
-- Subclass for physical activity habits
-- =============================================
CREATE TABLE physical_habits (
    habit_id BIGINT PRIMARY KEY,
    FOREIGN KEY (habit_id) REFERENCES habits(habit_id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: spiritual_habits
-- Subclass for spiritual/meditation habits
-- =============================================
CREATE TABLE spiritual_habits (
    habit_id BIGINT PRIMARY KEY,
    FOREIGN KEY (habit_id) REFERENCES habits(habit_id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: healthy_habits
-- Subclass for nutrition/wellness habits
-- =============================================
CREATE TABLE healthy_habits (
    habit_id BIGINT PRIMARY KEY,
    FOREIGN KEY (habit_id) REFERENCES habits(habit_id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: budgets
-- Monthly budget allocation per user
-- =============================================
CREATE TABLE budgets (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_budget DECIMAL(10,2),
    month INT,
    year INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: expenses
-- Individual expense transactions
-- =============================================
CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    budget_id INT,
    date DATE,
    description VARCHAR(255),
    amount DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE CASCADE
);

-- =============================================
-- TABLE: savings_goals
-- Financial savings targets for users
-- =============================================
CREATE TABLE savings_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100),
    saved_amount DECIMAL(10,2),
    target_amount DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- END OF SCHEMA
-- =============================================