
import cloudinary from "./cloudinary.js";

const uploadToCloudinary = async (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const extension = originalName?.split(".").pop()?.toLowerCase();

    const resourceType =
      extension === "pdf" ? "raw" : "image";

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "CollegePoints/certificates",
        resource_type: resourceType,
        public_id: `${Date.now()}-${originalName?.replace(/\.[^/.]+$/, "") || "certificate"}`,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;
