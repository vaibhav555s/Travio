// models/Itinerary.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  time:         { type: String },
  activity:     { type: String },
  location:     { type: String },
  costEstimate: { type: String },
}, { _id: false })

const dailyPlanSchema = new mongoose.Schema({
  day:        { type: Number },
  title:      { type: String },
  activities: [activitySchema],
}, { _id: false })

const itinerarySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
  },
  optionId: {
    type: String,
    enum: ["recommended", "high_energy", "budget_friendly"],
    required: true
  },
  estimatedTotalBudget: { type: String },
  tripSummary:          { type: String },
  travelTips:           [{ type: String }],
  dailyPlan:            [dailyPlanSchema],
  isSelected:           { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model("Itinerary", itinerarySchema)