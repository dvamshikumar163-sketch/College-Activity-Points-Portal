

import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/user.model.js";
import { DB_NAME } from "./utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from src/.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const createFaculty = async () => {
  try {
    const { MONGODB_URI } = process.env;

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from src/.env");
    }

    dns.setServers(["8.8.8.8", "8.8.4.4"]);

    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);

    console.log("Connected to MongoDB.");

    const email = "faculty@college.edu";
    const password = "Faculty@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.findOne({ email });

    if (user) {
      // Update existing faculty account.
      // Do not modify facultyAccess.
      user.role = "Faculty";
      user.password = hashedPassword;

      await user.save();

      console.log("Existing faculty password reset successfully.");
    } else {
      // Create a new faculty account if it does not exist.
      user = await User.create({
        email,
        password: hashedPassword,
        role: "Faculty",
        facultyAccess: false,
      });

      console.log("Faculty account created successfully.");
    }

    console.log("Faculty email:", email);
    console.log("Faculty access:", user.facultyAccess);
    console.log("Password reset completed.");
  } catch (error) {
    console.error("Faculty setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createFaculty();
