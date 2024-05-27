const express = require("express");
const router = express.Router();
const {
  verifyAuthToken,
  verifyAdmin,
} = require("../middlewares/auth.middlewares");
const extraServiceController = require("../controllers/extraService.controllers.js");

router
  .route("/")
  .post(verifyAuthToken, verifyAdmin, extraServiceController.addExtraService)
  .get(extraServiceController.getAllExtraServices);

router
  .route("/:id")
  .delete(
    verifyAuthToken,
    verifyAdmin,
    extraServiceController.deleteExtraService
  )
  .patch(
    verifyAuthToken,
    verifyAdmin,
    extraServiceController.updateExtraService
  )
  .get(extraServiceController.getExtraService);

module.exports = router;
