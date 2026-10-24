
import dns from "node:dns";
import dotenv from "dotenv";
import connectDB from "../db/index.js";
import { app } from "./app.js";

// Load local environment variables for development.
// Render dashboard environment variables are also available through process.env.
dotenv.config({
    path: "./src/.env",
});

// Do not override DNS servers here.
// Render should use its default DNS configuration.

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Express server error:", error);
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });
