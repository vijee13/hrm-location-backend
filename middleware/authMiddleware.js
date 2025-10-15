// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * roles: array of allowed roles e.g. ["admin"] or ["employee","admin"]
 */
export const authMiddleware = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Access denied: insufficient role" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
