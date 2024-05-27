const express = require("express");
const authController = require("../controllers/auth.controllers.js");
const authValidator = require("../validators/authValidator.js");
const validateRequest = require("../middlewares/validateRequest.js");
const { verifyAuthToken } = require("../middlewares/auth.middlewares.js");

const router = express.Router();

router.route("/login").post(authController.login);
router
  .route("/register")
  .post(validateRequest(authValidator.registerSchema), authController.register);

router
  .route("/user")
  .get(verifyAuthToken, authController.getUserData)
  .patch(verifyAuthToken, authController.updateProfile);

module.exports = router;
