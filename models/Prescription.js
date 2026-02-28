const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add medicine name']
  },
  dosage: {
    type: String,
    required: [true, 'Please add dosage (e.g., 1 tablet twice a day)']
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
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
  medicines: {
    type: [medicineSchema],
    required: [true, 'Please add at least one medicine'],
    validate: [v => Array.isArray(v) && v.length > 0, 'Please add at least one medicine']
  },
  instructions: {
    type: String,
    required: [true, 'Please add some instructions for the patient']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
