import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes/index.js";
import pool from "./config/db.js";

dotenv.config();

const app = express();

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});