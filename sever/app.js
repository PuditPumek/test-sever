import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger.js";
import routerBook from "./apps/routerbook.js";
import authRouter from "./apps/authbook.js";

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use("/books", routerBook);
app.use("/auth", authRouter);

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Book Store API",
        documentation: "/api-docs"
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);

    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});

export default app;
