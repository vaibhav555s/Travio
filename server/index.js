import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import speechRoutes from "./routes/speech.js";
import tripRoutes from "./routes/trip.routes.js"
import planRoutes from "./routes/plan.routes.js"
import connectDB from "./config/db.js";

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // credentials:true for cookies
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api", speechRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/plans', planRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error("--- GLOBAL ERROR ---");
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))