import "dotenv/config";
import cors from "cors";
import express from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "./db.js";

type Todo = {
  id: string;
  title: string;
  category: string;
  createdAt: number;
};

const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/todos", async (req, res) => {
  const category = (req.query.category as string) || "all";
  // We SELECT rows from MySQL.
  // `ORDER BY createdAt DESC` is the SQL version of "sort newest first".
  const sqlAll =
    "SELECT id, title, category, createdAt FROM todos ORDER BY createdAt DESC";
  const sqlByCategory =
    "SELECT id, title, category, createdAt FROM todos WHERE category = ? ORDER BY createdAt DESC";

  const [rows] =
    category === "all"
      ? await pool.execute<RowDataPacket[]>(sqlAll)
      // The `?` is a placeholder (parameter). We pass values separately to avoid SQL injection.
      : await pool.execute<RowDataPacket[]>(sqlByCategory,[category]);

  const todos: Todo[] = rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    category: String(r.category),
    createdAt: Number(r.createdAt),
  }));

  res.json(todos);
});

app.post("/api/todos", async (req, res) => {
  const { title, category } = req.body as Partial<Todo>;
  if (!title || !category) {
    return res.status(400).json({ message: "title and category are required" });
  }
  const newTodo: Todo = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(title).trim(),
    category: String(category),
    createdAt: Date.now()
  };

  await pool.execute(
    // INSERT = add a new row to the `todos` table.
    "INSERT INTO todos (id, title, category, createdAt) VALUES (?, ?, ?, ?)",
    [newTodo.id, newTodo.title, newTodo.category, newTodo.createdAt]
  );

  return res.status(201).json(newTodo);
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.execute<ResultSetHeader>(
    // DELETE removes a row by its primary key (`id`).
    "DELETE FROM todos WHERE id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Todo not found" });
  }
  return res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Todo server running on http://localhost:${PORT}`);
});
