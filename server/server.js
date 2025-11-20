// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to Database
connectDB().catch(err => console.error("DB Connection Error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static
app.use("/api/uploads", express.static("uploads"));

// Main Routes
app.use("/api/auth", authRoutes);             // Auth Routes
app.use("/api/files", fileRoutes);            // File Handling Routes
app.use("/api/valuations", valuationRoutes);  // Valuation Routes
app.use("/api/images", imageRoutes);          // Image Upload Routes

// Default route
app.get("/", (req, res) => {
  res.send("MERN Backend Running Successfully");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
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
  app.listen(PORT, () => {
    console.log("Server running on port", PORT);
  });
}
