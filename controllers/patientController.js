const catchAsync = require('../utils/catchAsync');
const patientService = require('../services/patientService');

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = catchAsync(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  const patient = await patientService.createPatient(req.body);

  res.status(201).json({
    success: true,
    data: patient
  });
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = catchAsync(async (req, res, next) => {
  const result = await patientService.getPatients(req.query);

  res.status(200).json({
    success: true,
    count: result.count,
    pagination: result.pagination,
    data: result.data
  });
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await patientService.getPatientById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error(`Patient not found with id of ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = catchAsync(async (req, res, next) => {
  let patient = await patientService.getPatientById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error(`Patient not found with id of ${req.params.id}`);
  }

  // Make sure user is patient owner or admin
  if (patient.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error(`User ${req.user.id} is not authorized to update this patient`);
  }

  patient = await patientService.updatePatient(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: patient
  });
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = catchAsync(async (req, res, next) => {
  const patient = await patientService.getPatientById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error(`Patient not found with id of ${req.params.id}`);
  }

  // Make sure user is patient owner or admin
  if (patient.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error(`User ${req.user.id} is not authorized to delete this patient`);
  }

  await patientService.deletePatient(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});
