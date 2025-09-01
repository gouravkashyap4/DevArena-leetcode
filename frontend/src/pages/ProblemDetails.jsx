import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import GeminiAI from "../components/GeminiAI";
import { motion } from "framer-motion";

// Build language-specific starter templates with a custom function name and optional signature hint
const buildStarterTemplate = (langKey, functionName = "solve", inputSignature = "string") => {
  if (langKey === "javascript") {
    return `// function: ${functionName}(input: ${inputSignature}) -> output\nfunction ${functionName}(input) {\n  // TODO: parse input and return the required output\n  // Example: return input; // echo\n  return input;\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\nconst result = ${functionName}(input);\nif (result !== undefined) {\n  console.log(typeof result === 'object' ? JSON.stringify(result) : String(result));\n}`;
  }
  if (langKey === "python") {
    return `# function: ${functionName}(input: ${inputSignature}) -> output\nimport sys\n\ndef ${functionName}(input_str: str):\n    # TODO: parse input_str and return the required output\n    # Example: return input_str  # echo\n    return input_str\n\nif __name__ == "__main__":\n    data = sys.stdin.read().strip()\n    out = ${functionName}(data)\n    if out is not None:\n        print(out if not isinstance(out, (dict, list)) else __import__('json').dumps(out))\n`;
  }
  if (langKey === "java") {
    return `// function: ${functionName}(input: ${inputSignature}) -> output\nimport java.io.*;\nimport java.util.*;\n\npublic class Main {\n    static String ${functionName}(String input) {\n        // TODO: parse input and return the required output\n        // Example: return input; // echo\n        return input;\n    }\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringBuilder sb = new StringBuilder();\n        String line;\n        while ((line = br.readLine()) != null) {\n            if (sb.length() > 0) sb.append('\\n');\n            sb.append(line);\n        }\n        String res = ${functionName}(sb.toString().trim());\n        if (res != null) System.out.println(res);\n    }\n}`;
  }
  if (langKey === "cpp") {
    return `// function: ${functionName}(input: ${inputSignature}) -> output\n#include <bits/stdc++.h>\nusing namespace std;\n\nstring ${functionName}(const string &input) {\n    // TODO: parse input and return the required output\n    // Example: return input; // echo\n    return input;\n}\n\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    std::string input((std::istreambuf_iterator<char>(cin)), std::istreambuf_iterator<char>());\n    while(!input.empty() && (input.back()=='\\n' || input.back()=='\\r')) input.pop_back();\n    string res = ${functionName}(input);\n    cout << res;\n    return 0;\n}`;
  }
  return `// Write your code here for ${functionName}`;
};

// Derive a reasonable function name from problem title if none is provided
const deriveFunctionNameFromTitle = (title) => {
  if (!title || typeof title !== "string") return "solve";
  // Remove non-alphanumeric, split words, camelCase them
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .map(w => w.toLowerCase());
  if (words.length === 0) return "solve";
  const camel = words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  // Ensure it starts with a letter
  return /^[a-zA-Z]/.test(camel) ? camel : `solve${camel}`;
};

const languages = [
  { id: 63, name: "JavaScript", monacoLang: "javascript" },
  { id: 62, name: "Java", monacoLang: "java" },
  { id: 71, name: "Python", monacoLang: "python" },
  { id: 54, name: "C++", monacoLang: "cpp" },
];

const ProblemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { addSolvedProblem, solvedProblems, user } = useAuth();

  const [showConfetti, setShowConfetti] = useState(false);
  const [output, setOutput] = useState("");
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [testResults, setTestResults] = useState([]);
  const [allPassed, setAllPassed] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [solveStartTime, setSolveStartTime] = useState(null);

  // Fetch problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/problems/${id}`,
          { withCredentials: true }
        );
        const prob = res.data;
        setProblem(prob);
        
        // Set solve start time when problem loads
        setSolveStartTime(Date.now());
        
        const preferredName = (prob.functionName && prob.functionName !== 'solve')
          ? prob.functionName
          : deriveFunctionNameFromTitle(prob.title);
        const initialTemplate = buildStarterTemplate(
          languages[0].monacoLang,
          preferredName,
          prob.inputSignature || "string"
        );
        setCode(initialTemplate);
      } catch (err) {
        console.error(err);
        navigate("/");
      }
    };
    fetchProblem();
  }, [id, navigate]);

  if (!problem) return <p className="p-6 text-white">Loading problem...</p>;

  // Run Code
  const handleRunCode = async () => {
    if (!problem.testCases || problem.testCases.length === 0) {
      toast.error("No test cases available.");
      return;
    }

    setLoading(true);
    setTestResults([]);

    const results = [];

    for (let tc of problem.testCases) {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/run`,
          {
            code,
            language: selectedLang.name.toLowerCase(),
            stdin: tc.input || "",
          }
        );

        const cleanedOutput = (res.data.output || "").trim();
        const expectedOutput = (tc.expectedOutput || "").trim();
        const passed = cleanedOutput === expectedOutput;

        results.push({ ...tc, output: cleanedOutput, passed });
      } catch (error) {
        console.error('Test case execution error:', error);
        results.push({ ...tc, output: "Error", passed: false });
      }
    }

    setTestResults(results);
    const allPass = results.every((r) => r.passed);
    setAllPassed(allPass);

    if (allPass) {
      toast.success("🎉 All test cases passed! Problem solved successfully!");
      setShowConfetti(true);
      
      // Auto-mark as solved if not already
      if (!solvedProblems.some((p) => (p._id || p.id) === (problem._id || problem.id))) {
        try {
          const solveTime = solveStartTime ? Date.now() - solveStartTime : null;
          await addSolvedProblem(problem, selectedLang.name, solveTime);
          toast.success("✅ Progress saved! Check your profile for updates.");
        } catch (error) {
          console.error("Failed to save progress:", error);
          toast.error("⚠️ Problem solved but failed to save progress. Try submitting manually.");
        }
      } else {
        toast.success("✅ Problem already solved! Great job!");
      }
    } else {
      toast.error("❌ Some test cases failed! Keep trying!");
      setShowConfetti(false);
    }

    setLoading(false);
  };

  // Submit Problem (Store in Backend)
  const handleSubmit = async () => {
    if (!allPassed) {
      toast.error("❌ All test cases must pass before submitting.");
      return;
    }

    try {
      const submitStartTime = Date.now();
      const solveTime = solveStartTime ? submitStartTime - solveStartTime : null;
      
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-progress/progress/solved`,
        {
          username: user,
          problemId: problem._id || problem.id,
          language: selectedLang.name,
          solveTime: solveTime
        },
        { withCredentials: true }
      );

      console.log("Solved problem response:", res.data);

      // Update local context
      if (!solvedProblems.some((p) => (p._id || p.id) === (problem._id || problem.id))) {
        await addSolvedProblem(problem, selectedLang.name, solveTime);
      }

      toast.success("🎯 Problem submitted successfully! Progress saved to your profile!");
      
      // Show achievement message based on difficulty
      const difficultyMessages = {
        "Easy": "🌟 Great start! You're building a strong foundation!",
        "Medium": "🚀 Excellent work! You're advancing your skills!",
        "Hard": "🏆 Outstanding! You've conquered a challenging problem!"
      };
      
      const message = difficultyMessages[problem.difficulty] || "🎉 Amazing job!";
      toast.success(message);
      
      setTimeout(() => handleNextQuestion(), 2000);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save progress. Please try again.");
    }
  };

  // Navigate to Next Question
  const handleNextQuestion = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/problems`, {
        withCredentials: true
      });
      const allProblems = res.data;
      const currentIndex = allProblems.findIndex((p) => p._id === problem._id);

      const nextProblem = allProblems[currentIndex + 1];

      if (nextProblem) {
        navigate(`/problems/${nextProblem._id}`);
        setAllPassed(false);
        setTestResults([]);
        setShowConfetti(false);
        setSolveStartTime(null);
      } else {
        toast.success("🎉 You've completed all problems!");
        navigate('/problems');
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch next question.");
    }
  };

  return (
    <div className="flex gap-4 p-6 text-white min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Toaster position="top-right" />
      {showConfetti && <Confetti width={width} height={height} />}

      {/* Left Panel */}
      <div className="w-1/2 p-4 border-r border-gray-700 overflow-auto">
        {/* Progress Indicator */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-300">Your Progress</span>
            <span className="text-green-400 font-semibold">{solvedProblems.length} problems solved</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((solvedProblems.length / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">{problem.title}</h1>
          {solvedProblems.some((p) => (p._id || p.id) === (problem._id || problem.id)) && (
            <span className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              ✅ Solved
            </span>
          )}
        </div>
        <p className="mb-4">{problem.description}</p>

        {problem.examples?.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Examples:</h2>
            {problem.examples.map((ex, idx) => (
              <div key={idx} className="mb-2 bg-gray-800 p-2 rounded">
                <p><strong>Input:</strong> {ex.input}</p>
                <p><strong>Output:</strong> {ex.output}</p>
                {ex.explanation && <p><strong>Explanation:</strong> {ex.explanation}</p>}
              </div>
            ))}
          </div>
        )}

        {problem.constraints && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Constraints:</h2>
            <div className="bg-gray-800 p-2 rounded">
              <p>{problem.constraints}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col gap-4">
        <select
          className="p-2 bg-gray-800 text-white rounded"
          value={selectedLang.id}
          onChange={(e) => {
            const lang = languages.find((l) => l.id === parseInt(e.target.value));
            setSelectedLang(lang);
            const key = lang.monacoLang;
            const fn = (problem?.functionName && problem.functionName !== 'solve')
              ? problem.functionName
              : deriveFunctionNameFromTitle(problem?.title);
            const sig = (problem?.inputSignature) || "string";
            setCode(buildStarterTemplate(key, fn, sig));
          }}
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>{lang.name}</option>
          ))}
        </select>

        <Editor
          height="50vh"
          language={selectedLang.monacoLang}
          value={code}
          onChange={setCode}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />

        <div className="flex gap-3 flex-wrap justify-center">
          <motion.button
            onClick={handleRunCode}
            className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <span className="relative flex items-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running...
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  Run Code
                </>
              )}
            </span>
          </motion.button>

          <motion.button
            onClick={handleSubmit}
            className="group relative overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-violet-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!allPassed}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <span className="relative flex items-center gap-2">
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              Submit
              <div className="w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
                <span className="text-green-800 text-xs font-bold">✓</span>
              </div>
            </span>
          </motion.button>

          <motion.button
            onClick={() => setShowGemini(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-orange-500/30 transition-all duration-200"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <span className="relative flex items-center gap-2">
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              Gemini AI
            </span>
          </motion.button>

          <motion.button
            onClick={handleNextQuestion}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium text-base shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.25 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <span className="relative flex items-center gap-2">
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              Next Question
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">→</span>
              </div>
            </span>
          </motion.button>
        </div>

        {/* Terminal Output */}
        <div className="bg-gray-900 p-4 rounded h-80 overflow-auto">
          {testResults.length === 0 && (
            <p className="text-gray-400">Output will appear here...</p>
          )}

          {testResults.map((tc, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded ${tc.passed ? "bg-green-700" : "bg-red-700"}`}
            >
              <p><strong>Test Case #{idx + 1}</strong></p>
              <p><strong>Input:</strong> {tc.input}</p>
              <p><strong>Expected:</strong> {tc.expectedOutput}</p>
              <p><strong>Output:</strong> {tc.output}</p>
              <p>Status: {tc.passed ? "Passed ✅" : "Failed ❌"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gemini AI Modal */}
      {showGemini && (
        <GeminiAI
          problemTitle={problem?.title}
          problemDescription={problem?.description}
          userCode={code}
          onClose={() => setShowGemini(false)}
        />
      )}
    </div>
  );
};

export default ProblemDetails;

