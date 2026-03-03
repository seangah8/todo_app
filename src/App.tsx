import { useEffect, useMemo, useState } from "react";

type Todo = {
  id: string;
  title: string;
  category: string;
  createdAt: number;
};

const CATEGORIES = ["Personal", "Work", "Study", "Errands"];

const loadTodos = async (category: string): Promise<Todo[]> => {
  const query = category === "all" ? "" : `?category=${encodeURIComponent(category)}`;
  const response = await fetch(`/api/todos${query}`);
  if (!response.ok) {
    throw new Error("Failed to load todos.");
  }
  return (await response.json()) as Todo[];
};

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    loadTodos(filterCategory)
      .then((items) => {
        if (isMounted) {
          setTodos(items);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load todos.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [filterCategory]);

  const visibleTodos = useMemo(() => {
    return [...todos].sort((a, b) => b.createdAt - a.createdAt);
  }, [todos]);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setIsLoading(true);
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, category })
      });
      if (!response.ok) {
        throw new Error("Failed to add todo.");
      }
      await loadTodos(filterCategory).then((items) => setTodos(items));
      setTitle("");
      setCategory(CATEGORIES[0]);
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete todo.");
      }
      await loadTodos(filterCategory).then((items) => setTodos(items));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Simple Todo</h1>
          <p>Frontend-only. Data is stored in your browser.</p>
        </div>
        <button type="button" onClick={() => setShowForm((prev) => !prev)}>
          {showForm ? "Cancel" : "Add Todo"}
        </button>
      </header>

      {showForm && (
        <form className="card" onSubmit={handleAdd}>
          <label>
            Todo
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a new todo"
            />
          </label>
          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Save</button>
        </form>
      )}

      <section className="card">
        <label>
          Filter by category
          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
          >
            <option value="all">All</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {error ? <p className="empty">{error}</p> : null}

        {isLoading ? (
          <p className="empty">Loading...</p>
        ) : visibleTodos.length === 0 ? (
          <p className="empty">No todos yet.</p>
        ) : (
          <ul className="list">
            {visibleTodos.map((todo) => (
              <li key={todo.id} className="list-item">
                <div>
                  <strong>{todo.title}</strong>
                  <span className="meta">{todo.category}</span>
                </div>
                <button type="button" onClick={() => handleDelete(todo.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
