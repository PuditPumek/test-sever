import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const authRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
authRouter.post("/register", async (req, res, next) => {
    try {
        const { username, password, firstname, lastname } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Check if user exists
        const existingUser = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const result = await pool.query(
            "INSERT INTO users (username, password, firstname, lastname) VALUES ($1, $2, $3, $4) RETURNING id, username, firstname, lastname",
            [username, hashedPassword, firstname || null, lastname || null]
        );

        return res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
authRouter.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Find user
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.json({
            message: "Login successful",
            token
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
authRouter.post("/logout", (req, res) => {
    // JWT is stateless, so logout is handled client-side by removing the token
    return res.json({ message: "Logout successful" });
});

export default authRouter;