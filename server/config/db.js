const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bloodbank';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB Connected successfully to:', uri);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
