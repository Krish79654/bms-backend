const jwt = require("jsonwebtoken");
const User = require("../models/user.models.js");

const verifyAuthToken = async (req, _, next) => {
  const token = req.header("Authorization");
  if (!token) {
    const statusCode = 401;
    const message = "Unauthorized HTTP, Token not provided";
    const error = {
      statusCode,
      message,
    };
    return next(error);
  }

  const jwtToken = token.replace("Bearer", "").trim();
  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    const userData = await User.findById(isVerified.userId).select({
      password: 0,
    });
    req.user = userData;
    req.token = token;
    req.userID = userData._id;
    next();
  } catch (error) {
    next(error);
  }
};

const verifyAdmin = async (req, _, next) => {
  if (!req.user?.isAdmin) {
    const statusCode = 401;
    const message = "Unauthorized HTTP, Admin access only";
    const error = {
      statusCode,
      message,
    };
    return next(error);
  }
  next();
};

module.exports = { verifyAuthToken, verifyAdmin };
