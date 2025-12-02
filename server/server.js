// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
const { connection } = mongoose;  // no unused variable warning
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// ---------------------------------------------------
// GLOBAL MONGOOSE CACHED CONNECTION (VERCEL SAFE)
// ---------------------------------------------------
let isConnected = false;

async function connectDatabase() {
  if (isConnected && connection.readyState === 1) return;

  const db = await connectDB();
  isConnected = connection.readyState === 1;
}

// ---------------------------------------------------
// SAFE CORS FOR SERVERLESS ENV (NO CRASHES)
// ---------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://valuation-qb2y.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);

      // Do NOT throw error in serverless
      return callback(null, false);
    },
    credentials: true,
  })
);

// ---------------------------------------------------
// BODY PARSERS
// ---------------------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------
// AUTO CONNECT DB ON EVERY REQUEST (CACHED)
// ---------------------------------------------------
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    res.status(503).json({ message: "DB unavailable" });
  }
});

// ---------------------------------------------------
// IMPORT ROUTES
// ---------------------------------------------------
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import customOptionsRoutes from "./routes/customOptionsRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";

// ---------------------------------------------------
// ROUTING
// ---------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/valuations", valuationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/options", customOptionsRoutes);
app.use("/api/pdf", pdfRoutes);

// ---------------------------------------------------
// ROOT PATH
// ---------------------------------------------------
app.get("/", (req, res) => {
  res.send("MERN Backend Running – Vercel Serverless Optimized");
});

// ---------------------------------------------------
// LOCAL SERVER (DEVELOPMENT ONLY)
// ---------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
