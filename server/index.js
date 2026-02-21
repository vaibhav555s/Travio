import 'dotenv/config'
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import itineraryRoutes from "./routes/itineraryRoutes.js";
import connectDB from "./config/db.js";

connectDB();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true })); // credentials:true for cookies
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", itineraryRoutes);
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))