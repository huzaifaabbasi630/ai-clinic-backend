const express = require('express');
const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateStatus,
  cancelAppointment
} = require('../controllers/appointmentController');

const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect); // All routes protected

// Doctors can view and update status, Admin/Receptionist can do everything
router
  .route('/')
  .post(authorize('admin', 'receptionist'), bookAppointment)
  .get(getAppointments);

router
  .route('/:id')
  .get(getAppointment)
  .delete(authorize('admin', 'receptionist'), cancelAppointment);

router
  .route('/:id/status')
  .put(updateStatus);

module.exports = router;
