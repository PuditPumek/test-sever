import pool from "../utils/db.js";


export async function getBooks(req, res) {
    const result = await pool.query("SELECT * FROM books");
    res.json(result.rows);
}


export async function createBook(req, res) {
    const { title, author, price } = req.body;
    await pool.query(
        "INSERT INTO books (title, author, price) VALUES ($1,$2,$3)",
        [title, author, price]
    );
    res.status(201).json({ message: "Book created" });
}