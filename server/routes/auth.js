// routes/auth.js
import express from "express";
import { register, login, refresh, logout, getMe } from "../controllers/authControllers.js"
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.post("/refresh",  refresh);
router.post("/logout",   logout);
router.get("/me",        protect, getMe);

export default router;