// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

// Socket events
import { setupChatEvents } from "./events/chatEvents.js";

// Load environment variables
dotenv.config();

// Initialize Express and HTTP Server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Setup Socket.io events
setupChatEvents(io);

// ❗Try to connect once on startup (non-blocking for Vercel export)
connectDB().catch((err) => {
  console.error("Initial DB Connection Error:", err.message);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Middleware to ensure database connection before processing requests
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected for this request. Reconnecting...");
      await connectDB();
    }
    next();
  } catch (error) {
    console.error("Database connection failed for request:", error.message);
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable",
      error: error.message,
    });
  }
});

// Serve uploaded files as static
app.use("/api/uploads", express.static("uploads"));

// Main Routes
app.use("/api/auth", authRoutes);             // Auth Routes
app.use("/api/files", fileRoutes);            // File Handling Routes
app.use("/api/valuations", valuationRoutes);  // Valuation Routes
app.use("/api/images", imageRoutes);          // Image Upload Routes
app.use("/api/chat", chatRoutes);             // Chat Routes

// Default route
app.get("/", (req, res) => {
  res.send("MERN Backend Running Successfully");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// For Vercel: Export the app
export default app;

// Start Server (only for local development)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log("Server running on port", PORT);
    console.log("WebSocket ready for chat");
  });
}
