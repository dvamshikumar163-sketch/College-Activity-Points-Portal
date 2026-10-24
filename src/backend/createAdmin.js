
import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/user.model.js";
import { DB_NAME } from "./utils/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const createAdmin = async () => {
  try {
    const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;


    if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in src/.env"
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 12 characters."
      );
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();

    
    dns.setServers(["8.8.8.8", "8.8.4.4"]);

    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);

    console.log("Connected to MongoDB.");

    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. No account was changed. Check the existing account before proceeding."
      );
    }

    
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    
    const admin = await User.create({
      email,
      password: hashedPassword,
      role: "Admin",
      facultyAccess: false,
    });

    console.log("Admin account created successfully!");
    console.log("Admin email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Password stored as a hash.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();



