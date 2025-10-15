// routes/attendanceRoutes.js
import express from "express";
import {
  markAttendance,
  getAttendanceHistory,
  getAllAttendanceRecords,
  getDailySummary,
  downloadAttendanceReport
} from "../controllers/employeeController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/mark", authMiddleware(["employee"]), markAttendance);
router.get("/history", authMiddleware(["employee"]), getAttendanceHistory);
router.get("/all", authMiddleware(["admin"]), getAllAttendanceRecords);
router.get("/daily-summary", authMiddleware(["admin"]), getDailySummary);
router.get("/download", authMiddleware(["admin"]), downloadAttendanceReport);

export default router;
