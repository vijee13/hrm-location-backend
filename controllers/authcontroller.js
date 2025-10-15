const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeModel");
const Admin = require("../models/adminModel");
const { createAccessToken, createRefreshToken } = require("../utils/tokenUtils");

/**
 * Client sends { refreshToken } in body (or cookie). We verify it, check DB,
 * then issue a new access token (and optionally a new refresh token).
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

    // Verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // payload should contain { id, role } because we signed like that earlier
    const { id, role } = payload;

    // find user by role
    const user = role === "admin" ? await Admin.findById(id) : await Employee.findById(id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Check if refresh token matches what we have in DB
    if (!user.refreshToken || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Refresh token mismatch" });
    }

    // Issue new tokens
    const newAccessToken = createAccessToken({ id: user._id, role: user.role, email: user.email });
    // Optionally rotate refresh token
    const newRefreshToken = createRefreshToken({ id: user._id, role: user.role });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
