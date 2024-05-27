const express = require("express");
const router = express.Router();
const hallController = require("../controllers/hall.controllers.js");
const { upload } = require("../middlewares/multer.middlewares.js");
const {
  verifyAuthToken,
  verifyAdmin,
} = require("../middlewares/auth.middlewares.js");

router
  .route("/")
  .post(
    verifyAuthToken,
    verifyAdmin,
    upload.array("images", 6),
    hallController.addHall
  )
  .get(hallController.getAllHalls);
router
  .route("/:id")
  .patch(
    verifyAuthToken,
    verifyAdmin,
    upload.array("images", 6),
    hallController.updateHall
  )
  .get(hallController.getHallById)
  .delete(verifyAuthToken, verifyAdmin, hallController.deleteHall);
router
  .route("/:id/images/:imageId")
  .delete(verifyAuthToken, verifyAdmin, hallController.removeImage);

module.exports = router;
