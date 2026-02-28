const catchAsync = require('../utils/catchAsync');
const adminService = require('../services/adminService');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await adminService.getDashboardStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});
