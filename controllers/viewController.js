const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours: tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // get the tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) {
    return next(new AppError("tour not found", 404));
  }

  res.status(200).render("tour", {
    title: `${tour.name} Tour`,
    tour: tour, // pug has access to these variables
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render("login", {
    title: "Log Into your account",
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  // dont need to query for user because protect middleware already carries the user
  res.status(200).render("account", {
    title: "Your account",
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  // find all bookings by user
  const bookings = await Booking.find({ user: req.user.id });

  // find the tours by user
  const tourIds = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "My Tours",
    tours: tours,
  });
});
