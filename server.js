const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Define Todo Schema
const todoSchema = new mongoose.Schema({
  todoName: String,
  todoDate: String
});

const Todo = mongoose.model("Todo", todoSchema);

// Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a todo
app.post("/api/todos", async (req, res) => {
  try {
    const { todoName, todoDate } = req.body;
    const newTodo = new Todo({ todoName, todoDate }); // ✅ Fixed this line
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id); // ✅ Fixed this line
    res.status(200).json({ message: "Todo Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
