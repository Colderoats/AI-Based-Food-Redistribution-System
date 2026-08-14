import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import routes from "./routes/index.js";
import pool from "./config/db.js";
import { initializeAiUpdateEmitter } from "./services/aiUpdateEmitter.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: true, methods: ["GET", "POST"] } });

io.use((socket, next) => {
  try {
    const user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    if (user.role !== "business") return next(new Error("Business access required"));
    socket.businessId = String(user.id);
    return next();
  } catch {
    return next(new Error("Authentication required"));
  }
});
io.on("connection", (socket) => socket.join(`business:${socket.businessId}`));
initializeAiUpdateEmitter(io);

// ===============================
// Middlewareeeee
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ===============================
// Database Connection Checkkkkkk
// ===============================

pool
  .connect()
  .then((client) => {
    console.log("✅ PostgreSQL Connected Successfully");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed");
    console.error(err.message);
  });

// ===============================
// API Routessss
// ===============================

app.use("/api", routes);

// ===============================
// Root Route
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI-Based Food Redistribution System API is running.",
  });
});

// ===============================
// 404 Handler
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ===============================
// Global Error Handler
// ===============================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error.",
  });
});

// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
