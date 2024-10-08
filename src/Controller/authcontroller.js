import User from "../Models/authSchema.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';

// Get all Users
export const getUserDetail = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ data: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
// Get User Profile by ID
export const getUserProfileById = async (req, res) => {
    const { id } = req.params; // Assume the user ID is passed as a route parameter

    try {
        const user = await User.findById(id).select('-password'); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ data: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
// export const updateUserProfile = async (req, res) => {
//     const userId = req.user.id; // Extract user ID from the request
//     const { username, email, mobileNo, address } = req.body;

//     console.log('Updating user profile for ID:', userId);
//     console.log('Request body:', req.body);

//     try {
//         const user = await User.findByIdAndUpdate(userId, { username, email, mobileNo, address }, { new: true });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json({ message: 'Profile updated successfully!', data: user });
//     } catch (error) {
//         console.error('Error updating user profile:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
  

export const registerUser = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('mobileNo').notEmpty().withMessage('Mobile number is required'),
    body('address').notEmpty().withMessage('Address is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, mobileNo, address } = req.body;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ 
                username, 
                email, 
                password: hashPassword, 
                mobileNo, // Save mobileNo
                address // Save address
            });
            await newUser.save();

            res.status(201).json({
                message: "Registration successful",
                user: { _id: newUser._id, email: newUser.email, username: newUser.username }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
];

// Login
export const loginUser = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });

            // Set the token as a cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000,
            });

            res.status(200).json({
                message: "Login successful",
                token, // Include the token in the response
                user: {
                    _id: user._id, // Ensure user ID is included
                    name: user.username,
                    email: user.email,
                },
            });
        } catch (error) {
            console.error('Error in loginUser:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
];

// Forgot Password
export const forgetPassword = [
    body('email').isEmail().withMessage('Invalid email'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const randomString = crypto.randomBytes(20).toString('hex');
            const expirationTimestamp = Date.now() + 3600000; // 1 hour

            user.randomString = randomString;
            user.expirationTimestamp = expirationTimestamp;
            await user.save();

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.MAIL,
                    pass: process.env.SECRET_KEY
                }
            });

            const resetURL = `${process.env.RESET_URL}/reset-password/${randomString}`;
            await transporter.sendMail({
                from: process.env.MAIL,
                to: user.email,
                subject: 'Password Reset Request',
                text: `Dear ${user.username},\n\nPlease reset your password using the following link:\n${resetURL}\n\nIf you did not request this, please ignore this email.`,
                html: `<p>Dear ${user.username},</p><p>Please reset your password using the following link:</p><p><a href="${resetURL}">${resetURL}</a></p><p>If you did not request this, please ignore this email.</p>`
            });

            res.status(200).json({ message: "Password reset link sent to your email" });
        } catch (error) {
            console.error("Error in forgetPassword:", error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
];

// Reset Password
export const resetPassword = [
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token } = req.params;
        const { newPassword } = req.body;

        try {
            const user = await User.findOne({
                randomString: token,
                expirationTimestamp: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ message: "Invalid or expired reset token" });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            user.randomString = null;
            user.expirationTimestamp = null;
            await user.save();

            res.status(200).json({ message: "Your new password has been updated" });
        } catch (error) {
            console.error("Error in resetPassword:", error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
];

export const logoutUser = (req, res) => {
  try {
    // Clear the token cookie
    res.cookie('token', '', {
      httpOnly: true, // Ensure the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      sameSite: 'Strict', // Helps prevent CSRF attacks
      expires: new Date(0) // Expire the cookie immediately
    });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};