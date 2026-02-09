import { Router } from "express";
import pool from "../utils/db.js";
import { protect } from "../middlewares/protect.js";

const routerBook = Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of all books
 */
routerBook.get("/", async (req, res, next) => {
    try {
        const result = await pool.query("SELECT * FROM book ORDER BY id ASC");
        return res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *       404:
 *         description: Book not found
 */
routerBook.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        const result = await pool.query("SELECT * FROM book WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Book created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
routerBook.post("/", protect, async (req, res, next) => {
    try {
        const { title, author, genre, price } = req.body;

        // Validation
        if (!title || !author || price === undefined) {
            return res.status(400).json({ message: "Title, author, and price are required" });
        }
        if (typeof price !== "number" || price < 0) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }

        const result = await pool.query(
            "INSERT INTO book (title, author, genre, price) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, author, genre || null, price]
        );

        return res.status(201).json({
            message: "Book created successfully",
            book: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               genre:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Book updated
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 */
routerBook.put("/:id", protect, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, author, genre, price } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        // Check if book exists
        const existingBook = await pool.query("SELECT * FROM book WHERE id = $1", [id]);
        if (existingBook.rows.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Validation
        if (price !== undefined && (typeof price !== "number" || price < 0)) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }

        const result = await pool.query(
            "UPDATE book SET title = COALESCE($1, title), author = COALESCE($2, author), genre = COALESCE($3, genre), price = COALESCE($4, price), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
            [title, author, genre, price, id]
        );

        return res.json({
            message: "Book updated successfully",
            book: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted
 *       404:
 *         description: Book not found
 *       401:
 *         description: Unauthorized
 */
routerBook.delete("/:id", protect, async (req, res, next) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid book ID" });
        }

        const result = await pool.query("DELETE FROM book WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json({
            message: "Book deleted successfully",
            book: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

export default routerBook;