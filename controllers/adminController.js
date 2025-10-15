const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createAccessToken, createRefreshToken } = require("../utils/tokenUtils");

const SALT_ROUNDS = 10;

exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const exist = await Admin.findOne({ email });
    if (exist) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newAdmin = await Admin.create({ email, password: hashedPassword });

    res.status(201).json({ message: "Admin registered", admin: { id: newAdmin._id, email: newAdmin.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: admin._id, role: admin.role, email: admin.email };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken({ id: admin._id, role: admin.role });

    admin.refreshToken = refreshToken;
    await admin.save();

    res.json({ message: "Admin login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.logoutAdmin = async (req, res) => {
  try {
    const { id } = req.user;
    const admin = await Admin.findById(id);
    if (admin) {
      admin.refreshToken = null;
      await admin.save();
    }
    res.json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
