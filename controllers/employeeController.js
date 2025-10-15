const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel"); // create attendance schema
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createAccessToken, createRefreshToken } = require("../utils/tokenUtils");
const haversine = require("haversine-distance");
const { Parser } = require("json2csv");

const SALT_ROUNDS = 10;

/* -------------------- AUTH: EMPLOYEE REGISTER -------------------- */
exports.registerEmployee = async (req, res) => {
  try {
    const { name, email, dob, mobile, address, password } = req.body;
    if (!name || !email || !dob || !mobile || !address || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const exist = await Employee.findOne({ email });
    if (exist) return res.status(400).json({ message: "Employee already exists" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newEmp = await Employee.create({
      name,
      email,
      dob,
      mobile,
      address,
      password: hashedPassword,
      role: "employee",
    });

    res.status(201).json({
      message: "Employee registered successfully",
      employee: { id: newEmp._id, email: newEmp.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- AUTH: EMPLOYEE LOGIN -------------------- */
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emp = await Employee.findOne({ email });
    if (!emp) return res.status(400).json({ message: "Employee not found" });

    const isMatch = await bcrypt.compare(password, emp.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: emp._id, role: emp.role, email: emp.email };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken({ id: emp._id, role: emp.role });

    emp.refreshToken = refreshToken;
    await emp.save();

    res.json({
      message: "Employee login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- AUTH: EMPLOYEE LOGOUT -------------------- */
exports.logoutEmployee = async (req, res) => {
  try {
    const { id } = req.user;
    const emp = await Employee.findById(id);
    if (emp) {
      emp.refreshToken = null;
      await emp.save();
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- ADMIN: CREATE EMPLOYEE -------------------- */
exports.createEmployeeByAdmin = async (req, res) => {
  try {
    const { name, email, phone, designation, department, dateOfJoining, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email & password are required" });

    const exist = await Employee.findOne({ email });
    if (exist) return res.status(400).json({ message: "Employee already exists" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const emp = await Employee.create({
      name,
      email,
      phone,
      designation,
      department,
      dateOfJoining,
      password: hashedPassword,
      role: "employee",
    });

    res.status(201).json({ message: "Employee created successfully", emp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- GET EMPLOYEES (Paginated + Search) -------------------- */
exports.getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const employees = await Employee.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Employee.countDocuments(query);

    res.json({ total, page: Number(page), limit: Number(limit), employees });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- GET EMPLOYEE BY ID -------------------- */
exports.getEmployeeById = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).select("-password -refreshToken");
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- UPDATE EMPLOYEE -------------------- */
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee updated successfully", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- DELETE EMPLOYEE -------------------- */
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Employee.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- SET OFFICE LOCATION (Admin only) -------------------- */
exports.setOfficeLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;

    // Convert to numbers
    const lat = Number(latitude);
    const lon = Number(longitude);
    const rad = Number(radius);

    if (!lat || !lon || !rad) {
      return res.status(400).json({ message: "Latitude, longitude, and radius are required" });
    }

    const admin = await Employee.findById(req.user.id);
    if (!admin || admin.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    admin.officeLocation = { latitude: lat, longitude: lon, radius: rad };
    await admin.save();

    res.json({ message: "Office location set successfully", officeLocation: admin.officeLocation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* -------------------- MARK ATTENDANCE (Employee) -------------------- */
exports.markAttendance = async (req, res) => {
  try {
    const { latitude, longitude, type } = req.body;
    const emp = await Employee.findById(req.user.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    if (!emp.officeLocation)
      return res.status(400).json({ message: "Office location not set by admin" });

    // Convert to numbers
    const lat = Number(latitude);
    const lon = Number(longitude);

    // Haversine distance calculation
    const distance = haversine(
      { lat, lon },
      { lat: emp.officeLocation.latitude, lon: emp.officeLocation.longitude }
    );

    if (distance > emp.officeLocation.radius)
      return res.status(400).json({ message: "You are outside office radius" });

    const attendance = await Attendance.create({
      employee: emp._id,
      type,
      latitude: lat,
      longitude: lon,
      date: new Date(),
    });

    res.json({ message: "Attendance marked successfully", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* -------------------- GET ATTENDANCE HISTORY (Employee) -------------------- */
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const empId = req.user.id;

    const records = await Attendance.find({ employee: empId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Attendance.countDocuments({ employee: empId });

    res.json({ total, page: Number(page), limit: Number(limit), records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- ADMIN: GET ALL ATTENDANCE -------------------- */
exports.getAllAttendanceRecords = async (req, res) => {
  try {
    const records = await Attendance.find().populate("employee", "name email department").sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- ADMIN: DAILY SUMMARY -------------------- */
exports.getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await Attendance.find({ date: { $gte: today } }).populate("employee", "name email department");

    const summary = {
      present: records.length,
      // You can extend: absent, late etc.
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- ADMIN: DOWNLOAD ATTENDANCE (JSON/CSV) -------------------- */
exports.downloadAttendanceReport = async (req, res) => {
  try {
    const records = await Attendance.find().populate("employee", "name email department");
    const fields = ["employee.name", "employee.email", "employee.department", "type", "date", "latitude", "longitude"];
    const parser = new Parser({ fields });
    const csv = parser.parse(records);
    res.header("Content-Type", "text/csv");
    res.attachment("attendance_report.csv");
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- GET PROFILE (Both Roles) -------------------- */
exports.getProfile = async (req, res) => {
  try {
    const emp = await Employee.findById(req.user.id).select("-password -refreshToken");
    if (!emp) return res.status(404).json({ message: "User not found" });
    res.json(emp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- DASHBOARD SUMMARY -------------------- */
exports.getDashboardSummary = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const totalEmployees = await Employee.countDocuments();
      const attendanceRecords = await Attendance.countDocuments();
      res.json({ totalEmployees, attendanceRecords });
    } else {
      const empId = req.user.id;
      const attendance = await Attendance.find({ employee: empId }).sort({ date: -1 }).limit(10);
      res.json({ attendance });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* -------------------- BACKWARD COMPATIBILITY -------------------- */
exports.getAllEmployees = exports.getEmployees;


