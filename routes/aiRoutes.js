const express = require('express');
const {
  symptomCheck,
  prescriptionExplain,
  riskFlag
} = require('../controllers/aiController');

const { protect } = require('../middlewares/authMiddleware');
const { requireProPlan } = require('../middlewares/subscriptionMiddleware');

const router = express.Router();

router.use(protect); // Ensure all AI usages are tracked per user

router.post('/symptom-check', requireProPlan, symptomCheck);
router.post('/prescription-explain', requireProPlan, prescriptionExplain);
router.post('/risk-flag', requireProPlan, riskFlag);

module.exports = router;
