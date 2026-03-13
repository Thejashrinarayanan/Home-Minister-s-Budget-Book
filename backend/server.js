const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Serve frontend (your path is correct)
app.use(express.static(path.join(__dirname, "frontend")));

// Default route -> open login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/index.html"));
});

// Start Server using Render's port
const PORT = process.env.PORT; // Render will provide the port dynamically
if (!PORT) {
  console.warn("⚠️ process.env.PORT not set. You may need to set a PORT environment variable locally for testing.");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

