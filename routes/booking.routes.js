const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controllers.js");
const {
  verifyAuthToken,
  verifyAdmin,
} = require("../middlewares/auth.middlewares.js");

router
  .route("/")
  .post(verifyAuthToken, bookingController.addBooking)
  .get(verifyAuthToken, bookingController.getBookings);

router
  .route("/:id")
  .delete(verifyAuthToken, bookingController.cancelBooking)
  .patch(verifyAuthToken, bookingController.updateBooking);

router.route("/check-availability").get(bookingController.checkAvailability);

module.exports = router;
