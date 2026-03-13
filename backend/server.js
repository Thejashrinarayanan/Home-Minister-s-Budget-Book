// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Catch-all route: for any frontend route not starting with /api
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start Server
// Start Server
const PORT = process.env.PORT; // remove fallback 5000 for Render
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

