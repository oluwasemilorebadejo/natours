const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "reviews cant be empty"],
    },
    rating: {
      type: Number,
      min: [1, "rating must be 1 or greater than 1"],
      max: [5, "rating must be 5 or less than 5"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      // uses parent ref
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "review must belong to a tour"],
    },
    user: {
      // uses parent ref
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // makes the user write only one review on tour

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });

  // this.populate({ path: "tour", select: "name photo" }); stop populating reviews with tours since tour is already populated with reviews

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // used .statics because we wanted to aggregate
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        numRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review document, constructor points to model->tour that created the document
  this.constructor.calcAverageRatings(this.tour);
});

// findbyidandupdate
// findbyidanddelete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // trick lets us retrieve current doc in query middleware
  // console.log(this.r);

  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  // await this.findOne() doesnt work here, the query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
