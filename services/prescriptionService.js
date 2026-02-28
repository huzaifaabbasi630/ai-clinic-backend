const Prescription = require('../models/Prescription');
const PDFDocument = require('pdfkit');

exports.createPrescription = async (data) => {
  return await Prescription.create(data);
};

exports.getPrescriptionsByPatient = async (patientId) => {
  return await Prescription.find({ patientId })
    .populate('doctorId', 'name email role')
    .sort({ createdAt: -1 });
};

exports.getPrescriptionById = async (id) => {
  return await Prescription.findById(id)
    .populate('patientId', 'name age gender contact')
    .populate('doctorId', 'name email role');
};

exports.generatePDF = (prescription, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=prescription-${prescription._id}.pdf`
  );

  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .text('MEDICAL PRESCRIPTION', { align: 'center' })
    .moveDown();

  doc
    .fontSize(12)
    .text(`Date: ${prescription.createdAt.toLocaleDateString()}`, { align: 'right' })
    .moveDown();

  // Doctor Info
  doc
    .fontSize(14)
    .text('Doctor Information', { underline: true })
    .fontSize(12)
    .text(`Name: ${prescription.doctorId.name}`)
    .text(`Email: ${prescription.doctorId.email}`)
    .moveDown();

  // Patient Info
  doc
    .fontSize(14)
    .text('Patient Information', { underline: true })
    .fontSize(12)
    .text(`Name: ${prescription.patientId.name}`)
    .text(`Age/Gender: ${prescription.patientId.age} / ${prescription.patientId.gender}`)
    .text(`Contact: ${prescription.patientId.contact}`)
    .moveDown();

  // Medicines
  doc
    .fontSize(14)
    .text('Medicines prescribed:', { underline: true })
    .moveDown(0.5);

  prescription.medicines.forEach((med, i) => {
    doc
      .fontSize(12)
      .text(`${i + 1}. ${med.name} - ${med.dosage}`);
  });
  doc.moveDown();

  // Instructions
  doc
    .fontSize(14)
    .text('Special Instructions:', { underline: true })
    .fontSize(12)
    .text(prescription.instructions)
    .moveDown();

  // Footer
  doc
    .fontSize(10)
    .text('This is a computer-generated prescription.', { align: 'center' });

  doc.end();
};
