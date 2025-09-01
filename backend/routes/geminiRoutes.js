import express from "express";
import { askGemini } from "../controllers/geminiController.js";

const router = express.Router();

// POST /api/gemini/ask
router.post("/ask", askGemini);

export default router;
