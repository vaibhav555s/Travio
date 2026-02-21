import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/speech-to-text", upload.single("audio"), async (req, res) => {
    console.log("📥 Audio request received");

    if (!req.file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({ error: "No audio file" });
    }

    console.log("📁 File info:");
    console.log("Size:", req.file.size);
    console.log("Mime Type:", req.file.mimetype);

    try {
        console.log("🧠 Sending audio to Sarvam...");

        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: "audio.webm",
            contentType: req.file.mimetype,
        });
        formData.append("model", "saaras:v3"); // Saaras v3 is the stable transcription model

        const response = await fetch("https://api.sarvam.ai/speech-to-text", {
            method: "POST",
            headers: {
                "api-subscription-key": process.env.SARVAM_API_KEY,
                ...formData.getHeaders()
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Sarvam API Error Status:", response.status);
            console.error("❌ Sarvam API Error Body:", errorText);
            return res.status(response.status).json({ error: "Sarvam AI error", details: errorText });
        }

        const result = await response.json();
        console.log("📝 Sarvam response:", result);

        res.json({ text: result.transcript || "" });

    } catch (error) {
        console.error("❌ Sarvam error:", error.message);
        res.status(500).json({ error: "Transcription failed" });
    }
});

export default router;
