
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    roll: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ["CSE", "ECE", "EEE", "CIVIL", "MECH"],
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    activityPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    categoryPoints: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;