import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controller/userController.js"; 
import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/profile", protectUser, getUserProfile);
router.put("/update-profile", protectUser, updateUserProfile);


export default router;
