const express = require("express");
const router = express.Router();
const { refreshToken } = require("../controllers/authcontroller");
const { authMiddleware } = require("../middleware/authMiddleware");

// Refresh token endpoint (no auth required)
router.post("/refresh-token", refreshToken);

// Optional: server-side logout route (requires access token)
router.post("/logout", authMiddleware(["employee","admin"]), async (req, res) => {
  const { id, role } = req.user;
  try {
    if (role === "admin") {
      const Admin = require("../models/adminModel");
      const admin = await Admin.findById(id);
      if (admin) {
        admin.refreshToken = null;
        await admin.save();
      }
    } else {
      const Employee = require("../models/employeeModel");
      const emp = await Employee.findById(id);
      if (emp) {
        emp.refreshToken = null;
        await emp.save();
      }
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
