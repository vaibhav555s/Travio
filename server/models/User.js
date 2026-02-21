import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  password:     { type: String },
  provider:     { type: String, default: "local" },
  googleId:     { type: String },
  refreshToken: { type: String },
  travelPersonality: {
    budgetFlexibility: { type: String, default: "medium" },
    travelSpeed:       { type: String, default: "moderate" },
    riskTolerance:     { type: String, default: "medium" },
    socialPreference:  { type: String, default: "group" },
  },
  tripHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);