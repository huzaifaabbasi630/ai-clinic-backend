const express = require('express');
const {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');

const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All routes are protected

router
  .route('/')
  .post(createPatient)
  .get(getPatients);

router
  .route('/:id')
  .get(getPatient)
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;
