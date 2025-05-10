import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", due_date: "" });
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get("http://localhost:5000/tasks");
    const sorted = res.data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const pending = sorted.filter((t) => !t.completed);
    const completed = sorted.filter((t) => t.completed);
    setTasks([...pending, ...completed]);
  };

  const addTask = async () => {
    const { title, description, due_date } = form;
    if (!title || !due_date) return alert("Title and due date are required.");
    await axios.post("http://localhost:5000/tasks", form);
    setForm({ title: "", description: "", due_date: "" });
    fetchTasks();
  };

  const toggleStatus = async (id) => {
    await axios.put(`http://localhost:5000/tasks/${id}`);
    fetchTasks();
  };

  const deleteSelected = async () => {
    await axios.post("http://localhost:5000/delete-multiple", { ids: selectedTasks });
    setSelectedTasks([]);
    fetchTasks();
  };

  const handleCheckbox = (id) => {
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  return (
    <div className="main-wrapper">
      <h1 className="main-title">To Do List</h1>
      <div className="split-container">
        <div className="left-section">
          <h2>Add Task</h2>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
          <button className="add-btn" onClick={addTask}>Add Task</button>
        </div>

        <div className="right-section">
          {selectedTasks.length > 0 && (
            <button className="delete-selected-btn" onClick={deleteSelected}>
              Delete Selected
            </button>
          )}
          <div className="task-table-wrapper">
            <table className="task-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className={task.completed ? "completed-row" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => handleCheckbox(task.id)}
                        className="outside-checkbox"
                      />
                    </td>
                    <td>{task.title}</td>
                    <td className="ellipsis">{task.description}</td>
                    <td>{new Date(task.due_date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="complete-btn"
                        onClick={() => toggleStatus(task.id)}
                      >
                        {task.completed ? "Completed" : "Pending"}
                      </button>
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => setModal(task)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modal.title}</h3>
            <p>{modal.description}</p>
            <p><strong>Due:</strong> {new Date(modal.due_date).toLocaleDateString()}</p>
            <button className="close-btn" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
