const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      subscriptionPlan: 'pro'
    });

    console.log('Admin user created:', admin.email);
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
