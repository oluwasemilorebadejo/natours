const mongoose = require("mongoose");
const slugify = require("slugify");
// const User = require("./userModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "a tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "a tour must have less than or equal 40 characters"],
      minlength: [10, "a tour must have more than or equal 10 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "a tour must have duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "a tour must have groupsize"],
    },
    difficulty: {
      type: String,
      required: [true, "a tour must have difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "difficulty is either easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "ratings must be above 1.0"],
      max: [5, "ratings must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10, // setter runs each time theres a new value
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "a tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // the this only points to current doc when creating a new doc and not for update
          return val < this.price; // the validate triggers the err only when the func returns false
        },
        message: "discount price ({VALUE}) should be less than regular price",
      },
    },
    summary: {
      type: String,
      required: [true, "a tour must have summary"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "a tour must have cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // dont show to users, only seen in db
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //embedding
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"], // makes the only option point
      },
      coordinates: [Number], // in form long, lat
      address: String,
      description: String,
    },
    locations: [
      // embedding
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      // child referencing
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// indexing
// tourSchema.index({ price: 1 }); // single index
tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" }); // for geodata

// virtual properties
tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
}); // this isnt available with arrow functions hence regular functions are used with mongoose!!!

// virtual populate to put reviews on the tour | we then populate the reviews property in our controller
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// document middleware only works on .save and .create. doesnt work on .update
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", async function (next) { // for embedding guides in tour, dont forget to add guides: Array in tour model. wouldnt work when update of user ie guide is done
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

// next();
// });

// // eslint-disable-next-line prefer-arrow-callback
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// query middleware
tourSchema.pre(/^find/, function (next) {
  // regex to work for anything that starts with find
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: "guides", select: "-__v -passwordChangedAt" });

  next();
});

// eslint-disable-next-line prefer-arrow-callback
tourSchema.post(/^find/, function (docs, next) {
  // console.log(`query took ${Date.now() - this.start} milliseconds`);
  next();
});

// aggregation middleware
// tourSchema.pre("aggregate", function (next) {
//   // this points to current aggregation
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
