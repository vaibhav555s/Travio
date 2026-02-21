// models/Plan.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  time:          { type: String },
  activity:      { type: String },
  location:      { type: String },
  costEstimate:  { type: String },
})

const dailyPlanSchema = new mongoose.Schema({
  day:        { type: Number },
  title:      { type: String },
  activities: [activitySchema],
})

const planSchema = new mongoose.Schema({
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
  optionId: {
    type: String,
    enum: ["recommended", "high_energy", "budget_friendly"],
    required: true
  },
  title:                { type: String },
  estimatedTotalBudget: { type: String },
  tripSummary:          { type: String },
  travelTips:           [{ type: String }],
  dailyPlan:            [dailyPlanSchema],
  isSelected:           { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model("Plan", planSchema)