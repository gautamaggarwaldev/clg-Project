import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} from "../controller/userController.js"; 
import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/profile", protectUser, getUserProfile);
router.put("/update-profile", protectUser, updateUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);


export default router;
