// ---------------------------------------------------
// server.js (Production-Ready / Vercel Compatible)
// ---------------------------------------------------

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

// ---------------------------------------------------
// ENVIRONMENT LOADING
// ---------------------------------------------------
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: envFile });

// ---------------------------------------------------
// EXPRESS APP
// ---------------------------------------------------
const app = express();

// ---------------------------------------------------
// GLOBAL MONGOOSE CACHED CONNECTION (VERCEL SAFE)
// ---------------------------------------------------
let globalConnection = global.mongooseConnection;

async function connectDatabase() {
  if (globalConnection && globalConnection.readyState === 1) {
    return globalConnection;
  }

  globalConnection = await connectDB();
  global.mongooseConnection = globalConnection; // cache globally for serverless

  return globalConnection;
}

// ---------------------------------------------------
// SECURE CORS (NO CRASH IN SERVERLESS)
// ---------------------------------------------------
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://valuation-qb2y.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // mobile apps, curl, postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);

      return callback(null, false); // block unknown but do NOT throw error
    },
    credentials: true,
  })
);

// ---------------------------------------------------
// BODY PARSER
// ---------------------------------------------------
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------
// AUTO DB CONNECTOR (SAFE FOR VERCEL)
// ---------------------------------------------------
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    res.status(503).json({ message: "Database unavailable" });
  }
});

// ---------------------------------------------------
// ROUTES
// ---------------------------------------------------
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import customOptionsRoutes from "./routes/customOptionsRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import billRoutes from "./routes/billRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/valuations", valuationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/options", customOptionsRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/bills", billRoutes);

// ---------------------------------------------------
// ROOT
// ---------------------------------------------------
app.get("/", (req, res) => {
  res.send("🚀 MERN Backend Running – Production Optimized");
});

// ---------------------------------------------------
// LOCAL DEVELOPMENT SERVER
// ---------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Local Server: http://localhost:${PORT}`)
  );
}

export default app;
