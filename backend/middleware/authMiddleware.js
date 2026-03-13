// authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load .env

module.exports = function(req, res, next) {
  try {
    // Get token from header: "Bearer TOKEN"
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1]; // Extract token
    if (!token) return res.status(401).json({ message: "Invalid token format" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ same secret as login
    req.user = decoded; // add user info to request

    next(); // allow access

  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
