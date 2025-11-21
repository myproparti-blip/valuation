// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import customOptionsRoutes from "./routes/customOptionsRoutes.js";

// Socket
import { setupChatEvents } from "./events/chatEvents.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Allowed frontend URL(s)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

// --------------------
// CORS (Fix)
// --------------------
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// OPTIONS FIX — prevents 500 on Vercel/Node 22
app.options("*", cors());

// ----------------------
// JSON PARSERS
// ----------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ----------------------
// STATIC FILES
// ----------------------
app.use("/api/uploads", express.static("uploads"));

// ----------------------
// ROUTES
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/valuations", valuationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/custom-options", customOptionsRoutes);

app.get("/", (req, res) => {
  res.send("MERN Backend Running Successfully");
});

// ----------------------
// ERROR HANDLER
// ----------------------
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ----------------------
// NOT FOUND
// ----------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----------------------
// SOCKET.IO
// ----------------------
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ----------------------
// START SERVER
// ----------------------
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    // Load socket events after DB ready
    setupChatEvents(io);
    console.log("Socket events loaded");

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
      console.log("🚀 Server running on port", PORT);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
