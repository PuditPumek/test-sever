import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.replace("Bearer ", "").trim();

        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = {
            id: payload.userId,
            username: payload.username
        };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token has expired" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(401).json({ message: "Authentication failed" });
    }
};
