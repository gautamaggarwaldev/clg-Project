import User from "../schema/userSchema.js";

const registerUserService = async (userData) => {
  const user = await User.create(userData);
  return user;
};

const loginUserService = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) return null;

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return null;

  return user;
};

const getUserByIdService = async (userId) => {
  return await User.findById(userId).select("-password");
};

const updateUserProfileService = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  return user;
};

export {
  registerUserService,
  loginUserService,
  getUserByIdService,
  updateUserProfileService,
};
