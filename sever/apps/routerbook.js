import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";
import { protect } from "../middlewares/protect.js"; 

const routerBook = Router();

routerBook.use(protect);

routerBook.get("/", (req, res) => {
    return res.json({ message: "This is book router" });
});

routerBook.get("/:id", (req, res) => {
    return res.json({ message: `Get book with id ${req.params.id}` });
});

routerBook.post("/", (req, res) => {
    return res.json({ message: "Create a new book" });
});

routerBook.put("/:id", (req, res) => {
    return res.json({ message: `Update book with id ${req.params.id}` });
});

routerBook.delete("/:id", (req, res) => {
    return res.json({ message: `Delete book with id ${req.params.id}` });
});

export default routerBook;