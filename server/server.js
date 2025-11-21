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
import customOptionsRoutes from "./routes/customOptionsRoutes.js";

// Socket events
import { setupChatEvents } from "./events/chatEvents.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Allowed frontend URLs
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5173",
];

// ----------------------------
// CORS (Full Fix)
// ----------------------------
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ❗Global OPTIONS handler (Fix for Node v22 – avoids "*")
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ----------------------------
// SOCKET.IO CORS
// ----------------------------
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Setup chat socket events
setupChatEvents(io);

// ----------------------------
// INITIAL DB CONNECT
// ----------------------------
connectDB().catch((err) =>
  console.error("Initial DB Connection Error:", err.message)
);

// ----------------------------
// REQUEST PARSERS
// ----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------
// ENSURE DB CONNECTED PER REQUEST
// ----------------------------
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB disconnected. Reconnecting...");
      await connectDB();
    }
    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable",
      error: error.message,
    });
  }
});

// ----------------------------
// STATIC FILES
// ----------------------------
app.use("/api/uploads", express.static("uploads"));

// ----------------------------
// ROUTES
// ----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/valuations", valuationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/chat", chatRoutes);

// ----------------------------
// ROOT ROUTE
// ----------------------------
app.get("/", (req, res) => {
  res.send("MERN Backend Running Successfully");
});

// ----------------------------
// ERROR HANDLER
// ----------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ----------------------------
// 404 HANDLER
// ----------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----------------------------
// START SERVER (LOCAL ONLY)
// ----------------------------
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log("Server running on port", PORT);
    console.log("WebSocket ready for chat");
  });
}

// Export for Vercel
export default app;
