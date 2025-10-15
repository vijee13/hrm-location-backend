require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");

    const testSchema = new mongoose.Schema({ name: String, createdAt: { type: Date, default: Date.now } });
    const Test = mongoose.model("Test", testSchema);

    const doc = await Test.create({ name: "Viji Atlas Test" });
    console.log("🎯 Document inserted:", doc);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

connectDB();
