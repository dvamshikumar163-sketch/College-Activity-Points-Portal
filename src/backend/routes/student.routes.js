import { Router } from "express";
import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";
import User from "../models/user.model.js";

const router = Router();


router.get("/", async (req, res) => {
  try {
    const students = await Student.find();

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Fetch students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch students.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Your profile setup session is missing. Please register again.",
      });
    }

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Your profile setup session expired. Please register again.",
      });
    }

    if (payload.purpose !== "student-profile-setup" || !payload.userId) {
      return res.status(403).json({
        success: false,
        message: "Invalid profile setup token.",
      });
    }

    const { name, roll, branch, year, section } = req.body;

    if (
      !name?.trim() ||
      !roll?.trim() ||
      !branch ||
      !year ||
      !section?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all student details.",
      });
    }

    const numericYear = Number(year);

    if (
      !Number.isInteger(numericYear) ||
      numericYear < 1 ||
      numericYear > 4
    ) {
      return res.status(400).json({
        success: false,
        message: "Academic year must be between 1 and 4.",
      });
    }

    const user = await User.findById(payload.userId).select("email");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Registered account not found.",
      });
    }

    const existingProfile = await Student.findOne({
      user: user._id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "A student profile already exists for this account.",
      });
    }

    const student = await Student.create({
      user: user._id,
      name: name.trim(),
      email: user.email,
      roll: roll.trim(),
      branch,
      year: numericYear,
      section: section.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Student profile saved successfully. You can now log in.",
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];

      const messages = {
        email: "This email already has a student profile.",
        roll: "This roll number is already registered.",
        user: "A student profile already exists for this account.",
        studentId: "A conflicting studentId database index exists.",
      };

      return res.status(409).json({
        success: false,
        message: messages[field] || "A duplicate value already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Student creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save student profile.",
    });
  }
});

router.patch("/profile/edit", async (req, res) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in first.",
      });
    }

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired login session.",
      });
    }

    
    if (!payload.userId || payload.purpose === "student-profile-setup") {
      return res.status(403).json({
        success: false,
        message: "Please log in with your student account.",
      });
    }

    const { year, section } = req.body;

    const numericYear = Number(year);

    if (
      year === undefined ||
      !Number.isInteger(numericYear) ||
      numericYear < 1 ||
      numericYear > 4
    ) {
      return res.status(400).json({
        success: false,
        message: "Academic year must be between 1 and 4.",
      });
    }

    if (typeof section !== "string" || !section.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid section.",
      });
    }

    const student = await Student.findOne({
      user: payload.userId,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    student.year = numericYear;
    student.section = section.trim();

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student details updated successfully.",
      data: {
        year: student.year,
        section: student.section,
      },
    });
  } catch (error) {
    console.error("Update student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update student details.",
    });
  }
});

export default router;