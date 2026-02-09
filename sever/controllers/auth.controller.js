import pool from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export async function register(req, res, next) {
    try {
        const { email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);


        await pool.query(
            "INSERT INTO users (email, password) VALUES ($1,$2)",
            [email, hash]
        );


        res.status(201).json({ message: "Register success" });
    } catch (err) {
        next(err);
    }
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);


        if (!user.rows[0]) return res.status(400).json({ message: "Invalid login" });


        const match = await bcrypt.compare(password, user.rows[0].password);
        if (!match) return res.status(400).json({ message: "Invalid login" });


        const token = jwt.sign({ id: user.rows[0].id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });


        res.json({ token });
    } catch (err) {
        next(err);
    }
}