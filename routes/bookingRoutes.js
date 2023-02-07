const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.post(
  "/create-checkout-session/:tourId",
  bookingController.createCheckoutSession
);

router.use(authController.restrictTo("admin", "lead-guide"));

router
  .route("/")
  .post(bookingController.createBooking)
  .get(bookingController.getAllBookings);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
