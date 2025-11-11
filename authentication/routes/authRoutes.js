import express from "express";
// Ensure authController.js exists in the specified path
import { registerUser } from "../conttrollers/authController.js";

const router = express.Router();

//route for user registration
router.post("/register", registerUser);

export default router;