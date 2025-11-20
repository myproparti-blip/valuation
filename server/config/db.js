import mongoose from "mongoose";

let isConnecting = false;
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If currently connecting, return the existing promise
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  isConnecting = true;

  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 120000,
    connectTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxConnecting: 10,
    retryWrites: true,
    w: "majority",
    family: 4,
    bufferCommands: false,
    autoCreate: true
  });

  try {
    await connectionPromise;
    isConnecting = false;
    console.log("MongoDB connected successfully");
    return mongoose;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default connectDB;
