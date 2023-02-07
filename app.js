const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// middleware
// serve static files
app.use(express.static(path.join(__dirname, "public")));

// set security http headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// log env variable
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
console.log(`ENVIROMENT: ${process.env.NODE_ENV}`);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many requests from this IP, pls try again after an hour",
});
app.use("/api", limiter); // applies ratelimiter on only /api routes

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

// prevent parameter polution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// routes

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

// route error handler
app.all("*", (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
