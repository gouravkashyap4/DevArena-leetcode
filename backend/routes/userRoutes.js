import express from 'express';
import mongosse from 'mongoose';
import { registerUser, loginUser, logOutUser, uploadProfilePhoto, getUserProfile, upgradeToPremium } from '../controllers/userController.js';
import userModel from '../models/User.js';
import upload from '../middleware/multer.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/loginUser', loginUser);
router.post('/logOutUser', logOutUser);
router.get('/profile', userAuth, getUserProfile);
router.post('/upload-profile-photo', userAuth, upload.single('profilePhoto'), uploadProfilePhoto);
router.post('/upgrade-to-premium', userAuth, upgradeToPremium);

export default router;