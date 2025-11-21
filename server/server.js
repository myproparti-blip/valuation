// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import customOptionsRoutes from "./routes/customOptionsRoutes.js";

dotenv.config();

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:5173",

  // Add your deployed frontend URL (VERY IMPORTANT)
  "https://valuation-qb2y.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle Vercel OPTIONS issue
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// DB connect
connectDB().catch((err) =>
  console.error("Initial DB Connection Error:", err.message)
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Re-check DB connection per request
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

// Static
app.use("/api/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/valuations", valuationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/options", customOptionsRoutes);

// Root
app.get("/", (req, res) => {
  res.send("MERN Backend Running Successfully (WebSockets Removed)");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log("Server running on port", PORT));
}

export default app;
