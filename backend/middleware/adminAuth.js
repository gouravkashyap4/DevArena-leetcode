import jwt from 'jsonwebtoken';
import userModel from '../models/User.js';

const adminAuth = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Check admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("AdminAuth Error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};

export default adminAuth;
