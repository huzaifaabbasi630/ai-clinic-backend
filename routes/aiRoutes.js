const express = require('express');
const {
  symptomCheck,
  prescriptionExplain
} = require('../controllers/aiController');

const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // Ensure all AI usages are tracked per user

router.post('/symptom-check', symptomCheck);
router.post('/prescription-explain', prescriptionExplain);

module.exports = router;
