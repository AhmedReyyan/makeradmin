import mongoose from 'mongoose';

// Default to a local MongoDB instance if no URI is provided
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/makeradmin';

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };
    
    // Add SSL options only if using Atlas
    if (MONGODB_URI.includes('mongodb+srv://')) {
      Object.assign(opts, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      });
    }

    console.log('Connecting to MongoDB:', 
      MONGODB_URI.includes('localhost') 
        ? MONGODB_URI 
        : MONGODB_URI.replace(/(mongodb\+srv:\/\/[^:]+:)[^@]+(@.+)/, '$1****$2')
    );
    
    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    } catch (error) {
      console.error('Failed to connect to primary MongoDB, trying local fallback:', error);
      // Try to connect to local MongoDB if the primary connection fails
      if (!MONGODB_URI.includes('localhost')) {
        cached.promise = mongoose.connect('mongodb://localhost:27017/makeradmin', opts);
      } else {
        throw error;
      }
    }
  }
  
  try {
    cached.conn = await cached.promise;
    console.log('Connected to MongoDB successfully');
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }
}

export default connectToDatabase;
