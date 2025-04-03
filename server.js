const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // HTTP server create kiya

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // ✅ Frontend ka sahi port (Vite)
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🚀 MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ Define Todo Schema
const todoSchema = new mongoose.Schema({
  todoName: String,
  todoDate: String,
});

const Todo = mongoose.model("Todo", todoSchema);

// ✅ Get all todos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a todo
app.post("/api/todos", async (req, res) => {
  try {
    const { todoName, todoDate } = req.body;
    const newTodo = new Todo({ todoName, todoDate });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Track Connected Users to Prevent Duplicates
const connectedUsers = new Set(); // 🔥 Track connected users

// ✅ Socket.io Connection (Real-Time Chat)
io.on("connection", (socket) => {
  if (connectedUsers.has(socket.id)) {
    console.log(`⚠️ Duplicate Connection Blocked: ${socket.id}`);
    return;
  }

  connectedUsers.add(socket.id);
  console.log("⚡ New User Connected:", socket.id);

  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message); // ✅ Broadcast message to all users
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
    connectedUsers.delete(socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
