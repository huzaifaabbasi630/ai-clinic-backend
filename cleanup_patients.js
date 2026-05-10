const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Patient = require('./models/Patient');

dotenv.config();

const cleanDummyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const namesToRemove = ['Jane Doe', 'Testing Patient', 'Noor'];
    
    const result = await Patient.deleteMany({
      name: { $in: namesToRemove }
    });

    console.log(`Successfully removed ${result.deletedCount} dummy patients.`);
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning dummy data:', error);
    process.exit(1);
  }
};

cleanDummyData();
