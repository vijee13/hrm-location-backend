const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type: { type: String, enum: ["check-in", "check-out"], required: true },
  date: { type: Date, default: Date.now },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
