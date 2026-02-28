const mongoose = require('mongoose');

const diagnosisLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user']
  },
  queryType: {
    type: String,
    enum: ['symptom-check', 'prescription-explain'],
    required: [true, 'Please define query type']
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  aiResponse: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  success: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DiagnosisLog', diagnosisLogSchema);
