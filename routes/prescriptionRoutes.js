const express = require('express');
const {
  createPrescription,
  getPatientPrescriptions,
  downloadPrescriptionPDF
} = require('../controllers/prescriptionController');

const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All routes protected

// Only doctors can create prescriptions
router
  .route('/')
  .post(authorize('doctor', 'admin'), createPrescription);

router
  .route('/patient/:patientId')
  .get(getPatientPrescriptions);

router
  .route('/:id/download')
  .get(downloadPrescriptionPDF);

module.exports = router;
