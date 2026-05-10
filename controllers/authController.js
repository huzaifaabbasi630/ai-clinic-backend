const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');

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
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      token: generateToken(user._id),
    });
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

  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    subscriptionPlan: user.subscriptionPlan,
    token: generateToken(user._id),
  });
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
