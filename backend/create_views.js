const mongoose = require("mongoose");
const MONGODB_URI = "mongodb://127.0.0.1:27017/student_project_management";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // Drop views if they exist to avoid duplicate errors
  try {
    await db.collection("student_details").drop();
    console.log("Dropped existing student_details view");
  } catch (e) {
    // Ignore error if it doesn't exist
  }

  try {
    await db.collection("teacher_details").drop();
    console.log("Dropped existing teacher_details view");
  } catch (e) {
    // Ignore error if it doesn't exist
  }

  console.log("Creating student_details view...");
  await db.createView("student_details", "students", [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        userId: 1,
        class: 1,
        major: 1,
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        email: "$user.email",
        role: "$user.role",
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  console.log("Creating teacher_details view...");
  await db.createView("teacher_details", "teachers", [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        userId: 1,
        degree: 1,
        firstName: "$user.firstName",
        lastName: "$user.lastName",
        email: "$user.email",
        role: "$user.role",
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);

  console.log("Successfully created student_details and teacher_details views!");
  await mongoose.disconnect();
}

run().catch(console.error);
