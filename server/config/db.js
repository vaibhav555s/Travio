// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
// config/db.js
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        tls: true,
        tlsAllowInvalidCertificates: false,
      })
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
      console.error(`Error: ${err.message}`)
      process.exit(1)
    }
  }

export default connectDB;