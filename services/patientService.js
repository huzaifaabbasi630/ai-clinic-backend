const Patient = require('../models/Patient');

exports.createPatient = async (patientData) => {
  return await Patient.create(patientData);
};

exports.getPatients = async (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const total = await Patient.countDocuments();
  
  const patients = await Patient.find()
    .skip(startIndex)
    .limit(limit)
    .populate('createdBy', 'name email');
    
  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  return {
    count: patients.length,
    pagination,
    data: patients
  };
};

exports.getPatientById = async (id) => {
  return await Patient.findById(id).populate('createdBy', 'name email');
};

exports.updatePatient = async (id, updateData) => {
  return await Patient.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};

exports.deletePatient = async (id) => {
  return await Patient.findByIdAndDelete(id);
};
