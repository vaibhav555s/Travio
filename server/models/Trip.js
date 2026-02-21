// models/Trip.js
import mongoose from "mongoose";

const travelerSchema = new mongoose.Schema({
  name:        { type: String, default: "Traveler" },
  energyLevel: { type: Number, default: 3 },
  budgetType:  { type: String, default: "Moderate" },
  interests:   [{ type: String }],
})

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  destination:   { type: String, required: true },
  departureDate: { type: Date, required: true },
  returnDate:    { type: Date, required: true },
  budget:        { type: Number, required: true },
  vibes:         [{ type: String }],
  travelers:     [travelerSchema],
  status: {
    type: String,
    enum: ["planning", "active", "completed"],
    default: "planning"
  },
}, { timestamps: true })

export default mongoose.model("Trip", tripSchema)