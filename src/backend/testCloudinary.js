import cloudinary from "./config/cloudinary.js";

console.log(
  "Cloudinary cloud name:",
  cloudinary.config().cloud_name
);