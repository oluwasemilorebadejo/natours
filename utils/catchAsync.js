module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// }; ACTUAL FUNCTION INCASE THERES PROBLEMS WITH ERR HANDLING
