// controllers/authController.js
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from "../utils/tokens.js";
import jwt from "jsonwebtoken";

// ─── Register ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password });

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({ accessToken, user: { id: user._id, name, email } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Login ──────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);
    res.json({ accessToken, user: { id: user._id, name: user.name, email } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Refresh Token ──────────────────────────────────────────
export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);
    res.json({ accessToken: newAccessToken });

  } catch {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

// ─── Logout ─────────────────────────────────────────────────
export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) { user.refreshToken = null; await user.save(); }
  }
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

// ─── Get Me ─────────────────────────────────────────────────
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -refreshToken");
  res.json(user);
};