// Middleware to validate user from request headers
export const authMiddleware = (req, res, next) => {
  try {
    const user = req.headers.authorization ? JSON.parse(decodeURIComponent(req.headers.authorization)) : null;
    
    if (!user || !user.username || !user.role) {
      return res.status(401).json({ message: "Unauthorized - Missing user information" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid user format" });
  }
};

// Check if user is manager or admin
export const isManagerOrAdmin = (req, res, next) => {
  if (req.user.role !== "manager1" && req.user.role !== "manager2" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Only manager or admin can perform this action" });
  }
  
  next();
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Only admin can perform this action" });
  }
  next();
};
