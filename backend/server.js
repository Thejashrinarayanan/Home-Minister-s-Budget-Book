// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Path to frontend build
const frontendBuildPath = path.join(__dirname, "frontend/build");

// Serve frontend only if build exists
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  // Catch-all route for React routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
} else {
  console.log(
    "⚠️ Frontend build folder not found. Run 'npm run build' in backend/frontend"
  );
}

// Start server using Render’s port
const PORT = process.env.PORT || 5000; // fallback for local dev
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
