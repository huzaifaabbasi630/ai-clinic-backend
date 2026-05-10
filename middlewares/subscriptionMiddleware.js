const catchAsync = require('../utils/catchAsync');

exports.requireProPlan = catchAsync(async (req, res, next) => {
  if (req.user.subscriptionPlan !== 'pro' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('This feature is only available for Pro users. Please upgrade your plan.');
  }
  next();
});
