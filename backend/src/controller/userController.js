import {
  registerUserService,
  loginUserService,
  getUserByIdService,
  updateUserProfileService,
} from "../service/userService.js";

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

export { registerUser, loginUser, getUserProfile, updateUserProfile };
