const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fbu_project";
  await mongoose.connect(uri);
  console.log("MongoDB connected:", uri.replace(/\/\/.*@/, "//***@"));
}

module.exports = connectDB;
