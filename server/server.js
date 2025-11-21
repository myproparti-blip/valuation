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
  process.env.CLIENT_URL || "http://localhost:3000"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/valuations", valuationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/custom-options", customOptionsRoutes);

app.get("/", (req, res) => res.send("MERN Backend Running Successfully"));

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// NOT FOUND
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ------------------------------------------------------------------
// FIXED: SERVER + DB + SOCKET ORDER
// ------------------------------------------------------------------
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

const startServer = async () => {
  try {
    // 1️⃣ CONNECT DB FIRST
    await connectDB();
    console.log("MongoDB Connected");

    // 2️⃣ ONLY AFTER DB READY → START SOCKET EVENTS
    setupChatEvents(io);
    console.log("Socket events loaded");

    // 3️⃣ NOW START SERVER
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

export default app;
