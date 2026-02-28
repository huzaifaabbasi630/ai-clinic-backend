const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const DiagnosisLog = require('../models/DiagnosisLog');

exports.getDashboardStats = async () => {
  // 1. Total Patients Count
  const totalPatients = await Patient.countDocuments();

  // 2. Total Doctors Count
  const totalDoctors = await User.countDocuments({ role: 'doctor' });

  // 3. Monthly Appointments Count (Current month)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalMonthlyAppointments = await Appointment.countDocuments({
    date: { $gte: firstDayOfMonth }
  });

  // 4. Most Common Diagnosis (Based on simulated logs)
  const diagnosisAgg = await DiagnosisLog.aggregate([
    { $match: { queryType: 'symptom-check' } },
    { $group: { _id: "$requestData.symptoms", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);

  const mostCommonDiagnosis = diagnosisAgg.length > 0 
    ? diagnosisAgg[0]._id 
    : 'No diagnosis data yet';

  // 5. Simulated Revenue (Based on completed appointments * $50)
  const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
  const simulatedRevenue = completedAppointments * 50; // Replace 50 with your actual simulated cost logic

  return {
    totalPatients,
    totalDoctors,
    totalMonthlyAppointments,
    mostCommonDiagnosis,
    simulatedRevenue
  };
};
