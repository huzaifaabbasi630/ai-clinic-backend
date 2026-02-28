const catchAsync = require('../utils/catchAsync');
const prescriptionService = require('../services/prescriptionService');

// @desc    Create new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor)
exports.createPrescription = catchAsync(async (req, res, next) => {
  // Ensure the logged in doctor is creating the prescription
  if (req.user.role === 'doctor') {
    req.body.doctorId = req.user.id;
  }
  
  const prescription = await prescriptionService.createPrescription(req.body);

  res.status(201).json({
    success: true,
    data: prescription
  });
});

// @desc    Get prescriptions for a patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
exports.getPatientPrescriptions = catchAsync(async (req, res, next) => {
  const prescriptions = await prescriptionService.getPrescriptionsByPatient(req.params.patientId);

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Download prescription as PDF
// @route   GET /api/prescriptions/:id/download
// @access  Private
exports.downloadPrescriptionPDF = catchAsync(async (req, res, next) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);

  if (!prescription) {
    res.status(404);
    throw new Error(`Prescription not found with id of ${req.params.id}`);
  }

  // Doctor access control (can only download their own)
  if (req.user.role === 'doctor' && prescription.doctorId._id.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this prescription');
  }

  prescriptionService.generatePDF(prescription, res);
});
