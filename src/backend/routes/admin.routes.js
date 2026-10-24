
import express from "express";
import User from "../models/user.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";
import bcrypt from "bcrypt";

const router = express.Router();


router.get(
  "/faculty",
  authMiddleware,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const faculty = await User.find({ role: "Faculty" })
        .select("_id email facultyAccess createdAt")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: faculty.length,
        faculty,
      });
    } catch (error) {
      console.error("Fetch faculty error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch faculty accounts.",
      });
    }
  }
);


router.post(
  "/faculty",
  authMiddleware,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid email and password are required.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 8 characters.",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const faculty = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        role: "Faculty",
        facultyAccess: false,
      });

      return res.status(201).json({
        success: true,
        message:
          "Faculty account created. Admin approval is required for access.",
        faculty: {
          id: faculty._id,
          email: faculty.email,
          role: faculty.role,
          facultyAccess: faculty.facultyAccess,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      console.error("Create faculty error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create faculty account.",
      });
    }
  }
);

router.patch(
  "/faculty/:facultyId/access",
  authMiddleware,
  allowRoles("Admin"),
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const { facultyAccess } = req.body;

      if (typeof facultyAccess !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "facultyAccess must be true or false.",
        });
      }

      if (!/^[0-9a-fA-F]{24}$/.test(facultyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid faculty ID.",
        });
      }

      const faculty = await User.findOneAndUpdate(
        { _id: facultyId, role: "Faculty" },
        { $set: { facultyAccess } },
        { new: true, runValidators: true }
      ).select("_id email role facultyAccess");

      if (!faculty) {
        return res.status(404).json({
          success: false,
          message: "Faculty account not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: facultyAccess
          ? "Faculty access granted successfully."
          : "Faculty access revoked successfully.",
        faculty,
      });
    } catch (error) {
      console.error("Update faculty access error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update faculty access.",
      });
    }
  }
);

export default router;
