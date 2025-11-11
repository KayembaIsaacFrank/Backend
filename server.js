import express from "express";
import pool from "./config/db.js";  // Fixed: Changed from "../config/db.js"
import authRoutes from "./authentication/routes/authRoutes.js";
import dotenv from "dotenv"

dotenv.config();

const app = express(); // Move this before using middleware

//middleware to read json
app.use(express.json());

//using path routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});