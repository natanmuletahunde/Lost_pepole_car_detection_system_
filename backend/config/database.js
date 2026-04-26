const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    // DEBUG: Let's see if the variable actually exists
    console.log('Checking MONGODB_URI:', process.env.MONGODB_URI ? 'Exists' : 'UNDEFINED');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from .env file!');
    }

    await mongoose.connect(process.env.MONGODB_URI); 
    console.log('✅ MongoDB connected...');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};


module.exports = connectDB;
