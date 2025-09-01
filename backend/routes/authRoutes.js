import express from 'express';
import jwt from 'jsonwebtoken';
import { googleLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/google', googleLogin);

//page reloade
router.get('/check', async (req, res) => {
  try {
    const token = req.cookies.token; // JWT from cookie
    if (!token) return res.json({ loggedIn: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database to get current information
    const userModel = (await import('../models/User.js')).default;
    const user = await userModel.findById(decoded.id);
    
    if (!user) {
      return res.json({ loggedIn: false });
    }

    res.json({ 
      loggedIn: true, 
      username: user.username, 
      role: user.role,
      token: token // Return the token so frontend can use it
    });
  } catch (err) {
    console.error('Auth check error:', err);
    res.json({ loggedIn: false });
  }
});

export default router;
