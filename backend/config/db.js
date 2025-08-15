const mongoose = require('mongoose');

async function connect(uri) {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { 
      dbName: 'salonDB',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

module.exports = { connect };
