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
