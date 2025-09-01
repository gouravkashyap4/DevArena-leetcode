import express from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/User.js';

const router = express.Router();

// Create admin user
router.post('/create-admin', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existing = await userModel.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    res.json({ message: 'Admin created successfully', admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
