import express from "express";
import upload from "../middlewares/upload.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import allowRoles from "../middlewares/role.middleware.js";
import {
  processCertificate,
  getCertificateHistory,
  getPendingCertificates,
  reviewCertificate,
} from "../controllers/certificate.controller.js";

const router = express.Router();

router.post(
  "/process/:studentId",
  authMiddleware,
  allowRoles("Student"),
  upload.single("certificate"),
  processCertificate
);


router.get(
  "/history/:studentId",
  authMiddleware,
  allowRoles("Student"),
  getCertificateHistory
);
router.get(
  "/faculty/pending",
  authMiddleware,
  allowRoles("Faculty"),
  getPendingCertificates
);
router.patch(
  "/faculty/:certificateId/review",
  authMiddleware,
  allowRoles("Faculty"),
  reviewCertificate
);

export default router;