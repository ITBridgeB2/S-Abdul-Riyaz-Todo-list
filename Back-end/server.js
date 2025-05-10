const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "todo_app",
});

// Get all tasks
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add new task
app.post("/tasks", (req, res) => {
  const { title, description, due_date } = req.body;
  db.query(
    "INSERT INTO tasks (title, description, due_date) VALUES (?, ?, ?)",
    [title, description, due_date],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, title, description, due_date, completed: 0 });
    }
  );
});

// Toggle task completion
app.put("/tasks/:id", (req, res) => {
  db.query(
    "UPDATE tasks SET completed = NOT completed WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.sendStatus(200);
    }
  );
});

// Delete multiple tasks
app.post("/delete-multiple", (req, res) => {
  const ids = req.body.ids;
  if (!ids || !Array.isArray(ids)) return res.status(400).send("Invalid request");
  db.query("DELETE FROM tasks WHERE id IN (?)", [ids], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
