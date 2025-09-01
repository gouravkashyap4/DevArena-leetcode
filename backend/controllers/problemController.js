import problemModel from "../models/Problem.js";

// Get all problems
export const getAllProblems = async (req, res) => {
  try {
    const problems = await problemModel.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get problem by ID
export const getProblemById = async (req, res) => {
  try {
    const problem = await problemModel.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new problem
export const createProblem = async (req, res) => {
  const { title, description, difficulty, tags, examples, constraints, solution, testCases, functionName, inputSignature } = req.body;

  const problem = new problemModel({
    title,
    functionName,
    inputSignature,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    solution,
    testCases
  });

  try {
    const savedProblem = await problem.save();
    res.status(201).json(savedProblem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
