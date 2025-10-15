const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 */

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/dashboard", authMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

module.exports = router;
