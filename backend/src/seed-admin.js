require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const connectDB = require("./configs/db");
const User = require("./models/user.model");

const adminSeed = {
  firstName: process.env.ADMIN_FIRST_NAME || "Admin",
  lastName: process.env.ADMIN_LAST_NAME || "FBU",
  email: process.env.ADMIN_EMAIL || "admin@fbu.edu.vn",
  password: process.env.ADMIN_PASSWORD || "Admin@2026",
  role: "admin",
};

async function seedAdmin() {
  await connectDB();

  const email = adminSeed.email.toLowerCase().trim();
  const hashedPassword = await bcrypt.hash(adminSeed.password, 10);

  const admin = await User.findOneAndUpdate(
    { email },
    {
      firstName: adminSeed.firstName,
      lastName: adminSeed.lastName,
      email,
      password: hashedPassword,
      role: adminSeed.role,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  console.log("Admin account is ready:");
  console.log(`- Email: ${admin.email}`);
  console.log(`- Password: ${adminSeed.password}`);
}

seedAdmin()
  .catch((error) => {
    console.error("Seed admin failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
