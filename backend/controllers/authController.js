import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import userModel from '../models/User.js';
import authRoutes from '../routes/authRoutes.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    const { idToken } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, name } = ticket.getPayload();

        let user = await userModel.findOne({ email });
        if (!user) {
            user = await userModel.create({
                email,
                username: name,
                googleId: ticket.getPayload().sub // unique Google ID
            });
        }



        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set cookie for frontend access
        res.cookie('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ 
            token, 
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                _id: user._id
            }
        })
    } catch (error) {
        res.status(400).json({ message: "Google login failed", error: error.message });
    }

}
