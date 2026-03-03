import mysql from "mysql2/promise";

// We keep DB settings in environment variables (in `.env` locally).
// This avoids hard-coding passwords in your code.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}


// A "pool" is a shared set of database connections your API reuses.
// Each request can borrow a connection, run SQL, then return it to the pool.
export const pool = mysql.createPool({
  host: requiredEnv("DB_HOST"),
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: requiredEnv("DB_USER"),
  password: requiredEnv("DB_PASSWORD"),
  database: requiredEnv("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
});

