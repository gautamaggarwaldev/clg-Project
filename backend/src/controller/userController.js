import User from "../schema/userSchema.js";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import {
  registerUserService,
  loginUserService,
  getUserByIdService,
  updateUserProfileService,
} from "../service/userService.js";
import loadTemplate from "../templates/templateHelper.js";

dotenv.config();

const registerUser = async (req, res) => {
  try {
    const user = await registerUserService(req.body);
    const token = user.generateJWT();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUserService(email, password);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = user.generateJWT();
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await getUserByIdService(req.user.id);
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to retrieve user profile",
      error: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await updateUserProfileService(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update user profile",
      error: error.message,
    });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    // Email setup
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or SMTP config
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`; //frontend route change in future

    const emailHtml = loadTemplate('password-reset', {
      resetLink,
    });

    const mailOptions = {
      to: user.email,
      from: 'no-reply@yourapp.com',
      subject: 'Password Reset Link',
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Reset link sent to email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = newPassword; // Make sure your User model hashes password in pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
};


export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
};
