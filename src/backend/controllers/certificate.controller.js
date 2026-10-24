
import { spawn } from "node:child_process";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import mongoose from "mongoose";

import uploadToCloudinary from "../config/cloudinaryUpload.js";
import Certificate from "../models/certificate.model.js";
import Student from "../models/student.model.js";

const ALLOWED_CATEGORIES = [
  "Technical Events",
  "Workshops",
  "Sports",
  "Cultural Activities",
  "Volunteering",
  "Other Activities",
];

const normalizeName = (name) =>
  (name || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const levenshteinDistance = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] +
          (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return dp[a.length][b.length];
};

const matchesStudentName = (registeredName, certificateName) => {
  const registeredParts = (registeredName || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const certificateParts = (certificateName || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const registeredWords = registeredParts
    .filter((part) => part.length > 1)
    .map(normalizeName);

  const certificateWords = certificateParts.map(normalizeName);

  if (!registeredWords.length || !certificateWords.length) {
    return false;
  }

  if (normalizeName(registeredName) === normalizeName(certificateName)) {
    return true;
  }

  const firstName = registeredWords[0];

  const wordsMatch = (a, b) =>
    a === b ||
    (a.length >= 4 &&
      b.length >= 4 &&
      levenshteinDistance(a, b) <= 1);

  const firstNameIndex = certificateWords.findIndex((word) =>
    wordsMatch(firstName, word)
  );

  if (firstNameIndex === -1) return false;
  if (certificateWords.length === 1) return true;

  const remainingCertificateWords = certificateWords.filter(
    (_, index) => index !== firstNameIndex
  );

  const remainingRegisteredWords = registeredWords.slice(1);

  if (
    remainingCertificateWords.every((word) =>
      remainingRegisteredWords.some((registeredWord) =>
        wordsMatch(registeredWord, word)
      )
    )
  ) {
    return true;
  }

  if (
    certificateWords.length === 2 &&
    certificateWords[0] === firstName
  ) {
    return remainingCertificateWords.some((word) =>
      remainingRegisteredWords.some((registeredWord) =>
        wordsMatch(registeredWord, word)
      )
    );
  }

  return false;
};

export const processCertificate = async (req, res) => {
  let tempFilePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a certificate.",
      });
    }

    const selectedCategory = String(req.body.category || "").trim();

    if (!ALLOWED_CATEGORIES.includes(selectedCategory)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid activity category.",
        allowedCategories: ALLOWED_CATEGORIES,
      });
    }

    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, JPG, JPEG, and PNG files are allowed.",
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    tempFilePath = path.join(
      tmpdir(),
      `certificate-${randomUUID()}${extension}`
    );

    await writeFile(tempFilePath, req.file.buffer);

    const pythonScript = path.join(
      process.cwd(),
      "ai",
      "process_certificate.py"
    );

    const details = await new Promise((resolve, reject) => {
      const python = spawn("python", [pythonScript, tempFilePath], {
        windowsHide: true,
      });

      let stdout = "";
      let stderr = "";

      python.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      python.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      python.on("error", reject);

      python.on("close", (code) => {
        if (code !== 0) {
          return reject(
            new Error(
              stderr || stdout || `Python exited with code ${code}`
            )
          );
        }

        try {
          const marker = "--- Extracted Certificate Details ---";
          const index = stdout.lastIndexOf(marker);

          if (index === -1) {
            throw new Error(
              "Could not find extracted JSON in Python output."
            );
          }

          resolve(
            JSON.parse(stdout.slice(index + marker.length).trim())
          );
        } catch (error) {
          reject(error);
        }
      });
    });

    if (!matchesStudentName(student.name, details.student_name)) {
      return res.status(400).json({
        success: false,
        message: "Student name does not match the certificate.",
        registeredName: student.name,
        extractedName: details.student_name || "",
      });
    }

    const fileHash = createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const existingCertificate = await Certificate.findOne({ fileHash });

    if (existingCertificate) {
      return res.status(409).json({
        success: false,
        message: "This certificate file has already been uploaded.",
      });
    }

    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );


    const savedCertificate = await Certificate.create({
      student: studentId,
      activityName:
        details.certificate_title || req.file.originalname,
      category: selectedCategory,
      certificateUrl: cloudinaryResult.secure_url,
      certificateId: "",
      extractedtext: JSON.stringify(details),
      fileHash,
      verificationStatus: "Pending",
      pointsAwarded: 0,
    });

    return res.status(200).json({
      success: true,
      message: "Certificate processed and saved successfully.",
      filename: req.file.originalname,
      details,
      certificate: savedCertificate,
    });
  } catch (error) {
    console.error("Certificate processing failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Certificate processing failed.",
      error: error.message,
    });
  } finally {
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }
  }
};


export const getCertificateHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const certificates = await Certificate.find({
      student: studentId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Certificate history failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificate history.",
    });
  }
};


export const getPendingCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      verificationStatus: "Pending",
    })
      .populate("student", "name email roll branch year section")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    console.error("Fetch pending certificates error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending certificates.",
    });
  }
};


export const reviewCertificate = async (req, res) => {
  const { certificateId } = req.params;
  const { decision, points } = req.body;

  if (!mongoose.isValidObjectId(certificateId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid certificate ID.",
    });
  }

  if (!["Approved", "Rejected"].includes(decision)) {
    return res.status(400).json({
      success: false,
      message: "Decision must be Approved or Rejected.",
    });
  }

  let awardedPoints = 0;

  if (decision === "Approved") {
    awardedPoints = Number(points);

    if (
      points === undefined ||
      points === null ||
      points === "" ||
      !Number.isFinite(awardedPoints) ||
      !Number.isInteger(awardedPoints) ||
      awardedPoints < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid non-negative whole number of points.",
      });
    }
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Only review certificates that are still pending.
      const certificate = await Certificate.findOneAndUpdate(
        {
          _id: certificateId,
          verificationStatus: "Pending",
        },
        {
          $set: {
            verificationStatus: decision,
            pointsAwarded:
              decision === "Approved" ? awardedPoints : 0,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!certificate) {
        const error = new Error(
          "Certificate not found or already reviewed."
        );
        error.statusCode = 409;
        throw error;
      }

      if (decision === "Approved") {
        const student = await Student.findById(
          certificate.student
        ).session(session);

        if (!student) {
          const error = new Error("Associated student not found.");
          error.statusCode = 404;
          throw error;
        }

        const category = String(
          certificate.category || "Other Activities"
        ).trim();

        if (!category) {
          const error = new Error("Certificate category is missing.");
          error.statusCode = 400;
          throw error;
        }

        // Update total activity points.
        student.activityPoints =
          Number(student.activityPoints || 0) + awardedPoints;

        // Ensure categoryPoints is a Mongoose Map.
        if (!(student.categoryPoints instanceof Map)) {
          student.categoryPoints = new Map(
            Object.entries(student.categoryPoints || {})
          );
        }

        // Add points only to this certificate's category.
        const currentCategoryPoints =
          Number(student.categoryPoints.get(category)) || 0;

        student.categoryPoints.set(
          category,
          currentCategoryPoints + awardedPoints
        );

        await student.save({ session });
      }
    });

    return res.status(200).json({
      success: true,
      message:
        decision === "Approved"
          ? "Certificate approved and overall/category-wise points updated."
          : "Certificate rejected.",
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Certificate review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review certificate.",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};



