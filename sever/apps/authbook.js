import { Router } from "express";
import bcrypt from " bcryptjs";
import jwt from "jsonwebtoken"; 
import { Pool } from "../utils/db.js";

const db = client.db("books-store");

const authRouterBook = Router();

authRouterBook.post("/register", async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const collection = db.collection("users");
    await collection.insertOne(user);

    return res.json({message: "User has been created successfully",user: user});
});

authRouterBook.post("/login", async (req, res) => {
    const {username, password} = req.body;

    const user = await db.collection("users").findOne({username});

    if (!user) {
        return res.status(404).json({message: "Invalid username or password"});
    }
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(400).json({message: "Invalid username or password"});
    }
    const jwtToken = jwt.sign(
        { userId: user._id, firstName: user.firstName, lastName: user.lastName },
        process.env.SECRET_KEY,
        { expiresIn: "900000" }        
    );
    return res.json({message: "Login successful", token: jwtToken});
});

authRouterBook.post("/logout", (req, res) => {
    return res.json({message: "Logout successful"});
});

export default authRouterBook;