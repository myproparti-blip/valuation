// config/db.js
import mongoose from "mongoose";

let isConnecting = false;
let connectionPromise = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is not defined in environment variables");
    throw new Error("MONGO_URI is not defined");
  }

  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    // Already connected
    return mongoose;
  }

  if (isConnecting && connectionPromise) {
    // Reuse existing promise if connection is in progress
    return connectionPromise;
  }

  isConnecting = true;

  // Disable buffering so we fail immediately instead of 'buffering timed out'
  mongoose.set("bufferCommands", false);

  connectionPromise = mongoose
    .connect(uri, {
      // Keep options minimal & sane
      serverSelectionTimeoutMS: 10000, // 10s to find a server
      maxPoolSize: 10,
      retryWrites: true,
      w: "majority",
      family: 4,
    })
    .then((m) => {
      isConnecting = false;
      console.log("✅ MongoDB connected:", m.connection.host, m.connection.name);
      return m;
    })
    .catch((err) => {
      isConnecting = false;
      connectionPromise = null;
      console.error("❌ MongoDB connection error:", err.message);
      throw err;
    });

  return connectionPromise;
};

export default connectDB;
