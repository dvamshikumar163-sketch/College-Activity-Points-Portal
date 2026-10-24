
import cloudinary from "../config/cloudinary.js";
import { Readable } from "node:stream";

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "collegepoints/certificates",
        resource_type: "raw",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export default uploadToCloudinary;
