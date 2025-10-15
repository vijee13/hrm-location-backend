import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  designation: String,
  department: String,
  dateOfJoining: Date,
  password: String
});

export default mongoose.model("Employee", employeeSchema);
