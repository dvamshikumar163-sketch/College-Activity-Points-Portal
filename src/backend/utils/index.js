

import dns from "node:dns";
import dotenv from "dotenv";
import connectDB from "../db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: "./src/.env",
});

if (!process.env.RENDER) {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

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
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    });
