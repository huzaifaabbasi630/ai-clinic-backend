const catchAsync = require('../utils/catchAsync');
const aiService = require('../services/aiService');

// @desc    Check symptoms via AI
// @route   POST /api/ai/symptom-check
// @access  Private
exports.symptomCheck = catchAsync(async (req, res, next) => {
  const { symptoms } = req.body;

  if (!symptoms) {
    res.status(400);
    throw new Error('Please provide symptoms to analyze');
  }

  // Forward to AI service
  const result = await aiService.analyzeSymptoms(symptoms, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      logId: result.log._id,
      response: result.aiData,
      isFallback: !result.successStatus
    }
  });
});

// @desc    Explain prescription via AI
// @route   POST /api/ai/prescription-explain
// @access  Private
exports.prescriptionExplain = catchAsync(async (req, res, next) => {
  const { prescriptionId } = req.body;

  if (!prescriptionId) {
    res.status(400);
    throw new Error('Please provide a prescription ID or details to explain');
  }

  // Forward to AI service
  const result = await aiService.explainPrescription(prescriptionId, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      logId: result.log._id,
      response: result.aiData,
      isFallback: !result.successStatus
    }
  });
});

// @desc    Analyze risk via AI
// @route   POST /api/ai/risk-flag
// @access  Private (Pro only via middleware)
exports.riskFlag = catchAsync(async (req, res, next) => {
  const { patientId, history } = req.body;

  if (!patientId || !history) {
    res.status(400);
    throw new Error('Please provide patient ID and history to analyze risk');
  }

  const result = await aiService.flagRisk(patientId, history, req.user.id);

  res.status(200).json({
    success: true,
    data: {
      logId: result.log._id,
      response: result.aiData,
      isFallback: !result.successStatus
    }
  });
});
