import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
});

const exampleSchema = new mongoose.Schema({
  input: String,
  output: String,
  explanation: String
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  functionName: {
    type: String,
    default: "solve" // logical default
  },
  inputSignature: {
    type: String, // e.g., "string", "number[]", "matrix", or free-text instructions
    default: "string"
  },
  description: {   // fixed typo
    type: String,
    required: true
  },
  difficulty: {    // new field for enum
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Easy"
  },
  tags: {
    type: [String],
    default: []
  },
  examples: [exampleSchema],
  constraints: {
    type: String
  },
  solution: {
    type: String
  },
  testCases: [testCaseSchema], // for running code
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const problemModel = mongoose.model("Problem", problemSchema);
export default problemModel;
