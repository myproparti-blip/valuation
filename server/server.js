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

// ----------------------------
// ALLOWED ORIGINS (static + dynamic Vercel preview)
// ----------------------------
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",

  // Your production frontend URL
  "https://valuation-qb2y.vercel.app",
];

// ----------------------------
// CORS MIDDLEWARE — FIX ALL VERCEL PREVIEWS
// ----------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, curl, etc.
      if (!origin) return callback(null, true);

      // Allow your static frontend URLs
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow ALL vercel.app preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Fix OPTIONS (Vercel + Node 22)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ----------------------------
// DATABASE INITIAL CONNECT
// ----------------------------
connectDB().catch((err) =>
  console.error("Initial DB Connection Error:", err.message)
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auto reconnect MongoDB per request
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
app.use("/api/options", customOptionsRoutes);

// ----------------------------
// ROOT ROUTE
// ----------------------------
app.get("/", (req, res) => {
  res.send("MERN Backend Running Successfully (WebSockets Removed)");
});

// ----------------------------
// GLOBAL ERROR HANDLER
// ----------------------------
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ----------------------------
// LOCAL SERVER (NOT USED ON VERCEL)
// ----------------------------
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log("Server running on port", PORT));
}

export default app;