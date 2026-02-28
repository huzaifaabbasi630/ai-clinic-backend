const catchAsync = require('../utils/catchAsync');
const appointmentService = require('../services/appointmentService');

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private (Admin, Receptionist)
exports.bookAppointment = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  
  const appointment = await appointmentService.createAppointment(req.body);

  res.status(201).json({
    success: true,
    data: appointment
  });
});

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = catchAsync(async (req, res, next) => {
  // If user is a doctor, they should only see their own appointments by default unless admin
  const query = { ...req.query };
  
  if (req.user.role === 'doctor') {
    query.doctorId = req.user.id;
  }

  const result = await appointmentService.getAppointments(query);

  res.status(200).json({
    success: true,
    count: result.count,
    pagination: result.pagination,
    data: result.data
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = catchAsync(async (req, res, next) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error(`Appointment not found with id ${req.params.id}`);
  }

  // Doctor can only view their own
  if (req.user.role === 'doctor' && appointment.doctorId._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this appointment');
  }

  res.status(200).json({
    success: true,
    data: appointment
  });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
exports.updateStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!status) {
    res.status(400);
    throw new Error('Please provide a status');
  }

  const appointment = await appointmentService.getAppointmentById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error(`Appointment not found with id ${req.params.id}`);
  }

  // Doctor can only update their own
  if (req.user.role === 'doctor' && appointment.doctorId._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this appointment');
  }

  const updatedAppointment = await appointmentService.updateAppointmentStatus(req.params.id, status);

  res.status(200).json({
    success: true,
    data: updatedAppointment
  });
});

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error(`Appointment not found with id ${req.params.id}`);
  }

  // Doctor shouldn't just delete, they can cancel status natively or let admin/reception delete
  if (req.user.role === 'doctor') {
    res.status(403);
    throw new Error('Doctors cannot delete appointments, only update status to cancelled');
  }

  await appointmentService.updateAppointmentStatus(req.params.id, 'cancelled');

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully'
  });
});
