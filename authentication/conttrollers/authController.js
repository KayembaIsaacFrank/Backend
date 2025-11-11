import pool from '../../config/db.js';
import bcrypt from "bcrypt";

//handling user registration

export const registerUser = async(req, res) => {
    try {
        //getting user data from body
        const { username, email, password } = req.body;

        //checking if user already exists
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
             return res.status(400).json({ message: "User already exists" });
        }

        //hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        //storing user in database
        await pool.query("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}