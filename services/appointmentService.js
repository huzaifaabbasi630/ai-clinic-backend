const Appointment = require('../models/Appointment');

exports.createAppointment = async (data) => {
  return await Appointment.create(data);
};

exports.getAppointments = async (query) => {
  let filter = {};

  // Filter by doctor
  if (query.doctorId) {
    filter.doctorId = query.doctorId;
  }

  // Filter by date (e.g., exact date or range)
  if (query.date) {
    // Exact date string matching or you can use range
    const searchDate = new Date(query.date);
    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);
    filter.date = {
      $gte: searchDate,
      $lt: nextDate
    };
  }
  
  // Status filter
  if (query.status) {
    filter.status = query.status;
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate('patientId', 'name age contact')
    .populate('doctorId', 'name email role')
    .skip(startIndex)
    .limit(limit)
    .sort({ date: 1 });

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  return {
    count: appointments.length,
    pagination,
    data: appointments
  };
};

exports.getAppointmentById = async (id) => {
  return await Appointment.findById(id)
    .populate('patientId', 'name age contact')
    .populate('doctorId', 'name email role');
};

exports.updateAppointmentStatus = async (id, status) => {
  return await Appointment.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
};

exports.deleteAppointment = async (id) => {
  return await Appointment.findByIdAndDelete(id);
};
