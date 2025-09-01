import express from "express";
import { addSolvedProblem, getSolvedProblems, getSolvedProblemsByUsername, getUserStats, fixUserStats } from "../controllers/userProgressController.js";

const router = express.Router();

// Use these endpoints
router.post("/progress/solved", addSolvedProblem);
router.get("/progress/username/:username", getSolvedProblemsByUsername);
router.get("/progress/:userId", getSolvedProblems);
router.get("/stats/:username", getUserStats);
router.post("/fix-stats/:username", fixUserStats);

export default router;
