import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Нет доступа" });
  }

  const token = authHeader.split(" ")[1];

  
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT Error:", error);
    res.status(401).json({ message: "Неверный или просроченный токен!" });
  }
};

export default authMiddleware;
