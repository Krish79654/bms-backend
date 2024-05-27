const User = require("../models/user.models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const login = async (req, res, next) => {
  try {
    const phone = req.body.phone;
    const password = req.body.password;

    // Find if user exist
    const userExist = await User.findOne({ phone });
    if (!userExist) throw new ApiError(400, "Invalid credentials");

    // Verify password
    const user = await userExist.comparePassword(password);
    if (!user) if (!userExist) throw new ApiError(400, "Invalid credentials");

    res.status(200).json(
      new ApiResponse(
        200,
        {
          token: await userExist.generateToken(),
          userId: userExist._id.toString(),
        },
        "Login successful"
      )
    );
  } catch (error) {
    next(error);
  }
};
const getUserData = (req, res, next) => {
  try {
    const userData = req.user;
    return res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};
const register = async (req, res, next) => {
  try {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;

    // Find if user exist
    const userExist = await User.findOne({ phone });
    if (userExist) {
      const error = {
        statusCode: 400,
        message: "User already exists with provided phone number",
      };
      return next(error);
    }

    const userCreated = await User.create({
      fullName,
      email,
      phone,
      password,
    });

    res.status(201).json({
      message: "Registration successful.",
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      const error = {
        statusCode: 404,
        message: "User not found",
      };
      return next(error);
    }

    // Check if the updated email or phone already exists for another user
    if (req.body.email) {
      const existingUserWithEmail = await User.findOne({
        email: req.body.email,
        _id: { $ne: userId },
      });
      if (existingUserWithEmail) {
        const error = {
          statusCode: 400,
          message: "Email is already in use by another user",
        };
        return next(error);
      }
    }
    if (req.body.phone) {
      const existingUserWithPhone = await User.findOne({
        phone: req.body.phone,
        _id: { $ne: userId },
      });
      if (existingUserWithPhone) {
        const error = {
          statusCode: 400,
          message: "Phone number is already in use by another user",
        };
        return next(error);
      }
    }

    // Update user information based on request body
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }
    if (req.body.email) {
      user.email = req.body.email;
    }
    if (req.body.phone) {
      user.phone = req.body.phone;
    }

    // Save the updated user information
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getUserData, updateProfile };
