// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
