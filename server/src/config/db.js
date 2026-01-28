const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config/env');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI); // no deprecated options needed on driver >=4
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
