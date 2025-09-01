import jwt from 'jsonwebtoken';
import userModel from '../models/User.js';

const userAuth = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies?.token;
    
    if (!token) {
      // Try Authorization header as fallback
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      console.log("No token found in cookies or Authorization header");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified for user ID:", decoded.id);

    // Find user in DB
    const user = await userModel.findById(decoded.id);
    if (!user) {
      console.log("User not found for ID:", decoded.id);
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Attach user to request object
    req.user = user;
    console.log("User authenticated:", user.username);
    next();
  } catch (error) {
    console.error("UserAuth Error:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(401).json({ message: "Unauthorized: Token verification failed" });
  }
};

export default userAuth;
