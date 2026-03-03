-- Run this in MySQL Workbench (or mysql CLI) to create the DB + table.

CREATE DATABASE IF NOT EXISTS learn_sql_todos
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE learn_sql_todos;

CREATE TABLE IF NOT EXISTS todos (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  createdAt BIGINT NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_todos_category_createdAt (category, createdAt)
) ENGINE=InnoDB;

