const mongoose = require("mongoose");

const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017/student_project_management";

function maskMongoUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`MongoDB connected: ${maskMongoUri(uri)}`);
}

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

module.exports = connectDB;
