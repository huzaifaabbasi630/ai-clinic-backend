const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res.status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, subscriptionPlan } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  user = await User.create({
    name,
    email,
    password,
    role,
    subscriptionPlan
  });

  if (user) {
    sendTokenResponse(user, 201, res);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json(user);
});

// @desc    Get all users (for Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    data: users
  });
});
