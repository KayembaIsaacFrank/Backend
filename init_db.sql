
CREATE DATABASE IF NOT EXISTS goldencrop_db;
USE goldencrop_db;
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(20)
);
CREATE TABLE IF NOT EXISTS produce (
  produce_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS procurement (
  proc_id INT AUTO_INCREMENT PRIMARY KEY,
  produce_id INT,
  tonnage DECIMAL(10,2),
  cost DECIMAL(12,2),
  recorded_by INT,
  date_time DATETIME DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS sales (
  sale_id INT AUTO_INCREMENT PRIMARY KEY,
  produce_id INT,
  tonnage DECIMAL(10,2),
  amount_paid DECIMAL(12,2),
  sales_agent_id INT,
  date_time DATETIME DEFAULT NULL
);
CREATE TABLE IF NOT EXISTS stock (
  stock_id INT AUTO_INCREMENT PRIMARY KEY,
  produce_id INT,
  current_balance DECIMAL(12,2),
  last_updated DATETIME DEFAULT NULL
);
