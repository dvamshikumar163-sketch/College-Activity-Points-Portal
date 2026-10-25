
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import upload from "../middlewares/upload.middleware.js";
import studentRouter from "../routes/student.routes.js";
import userRouter from "../routes/user.routes.js";
import uploadToCloudinary from "./cloudinaryUpload.js";
import certificateRouter from "../routes/certificate.route.js";
import adminRoutes from "../routes/admin.routes.js";

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://college-activity-points-portal.vercel.app",
  "https://college-activity-points-portal-pvl5-psi.vercel.app",
];


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CollegePoints backend is working!",
  });
});


app.post(
  "/api/test-upload",
  upload.single("certificate"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a certificate",
        });
      }

      const result = await uploadToCloudinary(req.file.buffer);

      return res.status(200).json({
        success: true,
        message: "Certificate uploaded to Cloudinary!",
        filename: req.file.originalname,
        certificateUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Certificate upload failed:", error.message);

      return res.status(500).json({
        success: false,
        message: "Certificate upload failed",
      });
    }
  }
);


app.use("/api/students", studentRouter);
app.use("/api/users", userRouter);
app.use("/api/certificates", certificateRouter);
app.use("/api/admin", adminRoutes);

export { app };
