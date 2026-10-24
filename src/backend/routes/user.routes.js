
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();


const createToken = (userId) =>
  jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

// REGISTER STUDENT
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

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

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    
    const profileSetupToken = jwt.sign(
      {
        userId: user._id.toString(),
        purpose: "student-profile-setup",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user._id,
        email: user.email,
      },
      profileSetupToken,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed due to a server error.",
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const role = user.role || "Student";

  
    if (role === "Student") {
      const student = await Student.findOne({
        user: user._id,
      });

      if (!student) {
        return res.status(403).json({
          success: false,
          profileIncomplete: true,
          message:
            "Please complete your student profile before logging in.",
        });
      }

      const token = createToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Student login successful.",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: "Student",
        },
        student,
      });
    }

    
    if (role === "Faculty") {
      const token = createToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Faculty login successful.",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: "Faculty",
        },
      });
    }

    
    if (role === "Admin") {
      const token = createToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Admin login successful.",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: "Admin",
        },
      });
    }

    
    return res.status(403).json({
      success: false,
      message: "Invalid user role.",
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed due to a server error.",
    });
  }
});


router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("email role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
    });
  }
});

export default router;
