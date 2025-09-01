import express from 'express';
import router from '../routes/userRoutes.js';
import userModel from '../models/User.js'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';


// register user
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Password validation
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        
        if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least 1 capital letter" });
        }
        
        if (!/[0-9]/.test(password)) {
            return res.status(400).json({ message: "Password must contain at least 1 number" });
        }
        
        // Check if user exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        })

        // jwt web Token
        let token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role
        },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            })

        //cookie setup
        res.cookie("token", token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000 // 1 hour
        })
        res.json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                _id: user._id
            },
            token: token,
        });
    } catch (error) {
        res.send(error)
    }
}

// login user 
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        //checking user exist
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // password cheking
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // genrate jwt
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        // send token in cookie
        res.cookie('token', token, {
            httpOnly: false, // Changed to false to allow frontend access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600000
        });
        return res.json({ 
            message: "Login successful", 
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                _id: user._id
            }, 
            token 
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// log - out user
export const logOutUser = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie("token", {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/', // Ensure cookie is cleared from all paths
            domain: undefined // Clear from current domain
        });
        
        // Also clear any other auth-related cookies
        res.clearCookie("auth", {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            domain: undefined
        });
        
        console.log('User logged out successfully');
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, try to clear cookies
        res.clearCookie("token", {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            domain: undefined
        });
        return res.status(200).json({ message: "Logged out successfully" });
    }
}

// upload profile photo
export const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // User is already attached by userAuth middleware
        const user = req.user;
        
        // Update user with profile photo URL
        user.profilePhoto = req.file.path; // Cloudinary URL
        await user.save();

        res.json({ 
            message: "Profile photo uploaded successfully", 
            profilePhoto: user.profilePhoto 
        });
    } catch (error) {
        console.error('Profile photo upload error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// get user profile
export const getUserProfile = async (req, res) => {
    try {
        // User is already attached by userAuth middleware
        const user = req.user;
        
        res.json({
            username: user.username,
            email: user.email,
            profilePhoto: user.profilePhoto,
            role: user.role,
            isPremium: user.isPremium,
            joinedAt: user.joinedAt
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// upgrade user to premium
export const upgradeToPremium = async (req, res) => {
    try {
        const { plan, paymentId, orderId, amount } = req.body;
        const user = req.user; // from userAuth middleware
        
        // Update user's premium status
        user.isPremium = true;
        user.premiumPlan = plan;
        user.premiumSince = new Date();
        user.lastPaymentId = paymentId;
        user.lastOrderId = orderId;
        user.lastPaymentAmount = amount;
        
        await user.save();
        
        console.log(`User ${user.email} upgraded to premium with plan: ${plan}`);
        
        res.json({ 
            message: "Premium upgrade successful", 
            isPremium: true,
            plan: plan,
            upgradedAt: user.premiumSince
        });
    } catch (error) {
        console.error('Premium upgrade error:', error);
        res.status(500).json({ message: "Premium upgrade failed", error: error.message });
    }
}



