// Script to test MongoDB connection
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Using connection string:', MONGODB_URI.replace(/:([^:@]+)@/, ':***@')); // Hide password in logs
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI_LOADED: !!process.env.MONGODB_URI,
  MONGODB_URI_PREFIX: process.env.MONGODB_URI?.substring(0, 20) + '...'
});

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
