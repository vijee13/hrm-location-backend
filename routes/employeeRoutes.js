// routes/employeeRoutes.js
import express from "express";
import {
  registerEmployee,
  loginEmployee,
  logoutEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  setOfficeLocation,
  markAttendance,
  getAttendanceHistory,
  getAllAttendanceRecords,
  getDailySummary,
  downloadAttendanceReport,
  getProfile,
  getDashboardSummary
} from "../controllers/employeeController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authMiddleware(["admin"]), registerEmployee);
router.post("/login", loginEmployee);
router.post("/logout", authMiddleware(["employee", "admin"]), logoutEmployee);

router.get("/", authMiddleware(["admin"]), getAllEmployees);
router.get("/:id", authMiddleware(["admin"]), getEmployeeById);
router.put("/:id", authMiddleware(["admin"]), updateEmployee);
router.delete("/:id", authMiddleware(["admin"]), deleteEmployee);

router.post("/set-office-location", authMiddleware(["admin"]), setOfficeLocation);

router.post("/attendance/mark", authMiddleware(["employee"]), markAttendance);
router.get("/attendance/history", authMiddleware(["employee"]), getAttendanceHistory);

router.get("/attendance/all", authMiddleware(["admin"]), getAllAttendanceRecords);
router.get("/attendance/daily-summary", authMiddleware(["admin"]), getDailySummary);
router.get("/attendance/download", authMiddleware(["admin"]), downloadAttendanceReport);

router.get("/profile", authMiddleware(["employee", "admin"]), getProfile);
router.get("/dashboard", authMiddleware(["employee", "admin"]), getDashboardSummary);

export default router;
