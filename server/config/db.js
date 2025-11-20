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
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 60000,
    connectTimeoutMS: 10000,
    maxPoolSize: 5,
    minPoolSize: 1,
    retryWrites: true,
    w: "majority",
    retryWrites: true,
    maxConnecting: 5
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
