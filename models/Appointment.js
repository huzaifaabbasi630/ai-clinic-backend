const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: [true, 'Please add a patient']
  },
  doctorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add a doctor']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date and time for the appointment']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'scheduled'],
    default: 'pending'
  },
  reason: {
    type: String
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);
