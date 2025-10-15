import Attendance from "../models/attendanceModel.js";
import haversine from "haversine-distance";
import officeLocation from "./locationController.js";

// Mark Attendance (Check-in / Check-out)
export const markAttendance = async (req, res) => {
  try {
    const { employeeId, lat, long, type } = req.body;
    const distance = haversine(officeLocation, { lat, long });

    if (distance > officeLocation.radius)
      return res.status(400).json({ message: "Out of office location" });

    const today = new Date().toDateString();
    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: new Date(today) },
    });

    if (type === "check-in") {
      if (attendance) return res.json({ message: "Already checked in" });
      attendance = await Attendance.create({
        employeeId,
        checkInTime: new Date(),
        location: { lat, long },
      });
    } else if (type === "check-out") {
      if (!attendance) return res.json({ message: "No check-in found" });
      attendance.checkOutTime = new Date();
      await attendance.save();
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// View Attendance History (Employee)
export const viewAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const records = await Attendance.find({ employeeId: req.user.id })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin - View All Attendance
export const getAllAttendance = async (req, res) => {
  try {
    const { employee, department, date } = req.query;
    let query = {};
    if (employee) query.employeeId = employee;
    if (date) query.date = new Date(date);
    const records = await Attendance.find(query).populate("employeeId");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
