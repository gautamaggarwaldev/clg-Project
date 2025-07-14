import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controller/userController.js"; 
import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protectUser, getUserProfile);
router.put("/update-profile", protectUser, updateUserProfile);

export default router;
