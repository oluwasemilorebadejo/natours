const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

exports.getAllReviews = factory.getAll(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId }; // both lines take tourId from tourrouter/reviews and the tourId is filtered to get reviews for only particular tour
//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: "success",
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.setTourAndUserIds = async (req, res, next) => {
  // nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);

// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
