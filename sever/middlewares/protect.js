import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "unsupported authorization method" });
    }

    token = token.replace("Bearer ", "").trim();
    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = {};
        req.user.id = payload.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "token is invalid" });
    }
};
