const express = require("express");
const router = express.Router();
const {
  verifyAuthToken,
  verifyAdmin,
} = require("../middlewares/auth.middlewares");
const menuController = require("../controllers/menu.controllers.js");

router
  .route("/")
  .post(verifyAuthToken, verifyAdmin, menuController.addMenu)
  .get(menuController.getMenus);
router
  .route("/:id")
  .delete(verifyAuthToken, verifyAdmin, menuController.deleteMenu)
  .patch(verifyAuthToken, verifyAdmin, menuController.updateMenu)
  .get(menuController.getMenu);

module.exports = router;
