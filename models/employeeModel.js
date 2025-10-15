const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: Date,
  mobile: String,
  address: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "employee"], default: "employee" },
  refreshToken: String,
  officeLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    radius: { type: Number } // in meters
  }
});

module.exports = mongoose.model("Employee", employeeSchema);
