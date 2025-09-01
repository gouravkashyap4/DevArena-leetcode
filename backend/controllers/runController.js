import axios from "axios";

export const runCode = async (req, res) => {
  const { code, language, stdin } = req.body;

  if (!code || !language) {
    return res.status(400).json({ output: "Code or language is missing" });
  }
  const languageMap = {
    javascript: 63,
    python: 71,
    java: 62,
    cpp: 54,
    c: 50
  };

  const language_id = languageMap[language.toLowerCase()];
  if (!language_id) return res.status(400).json({ output: "Unsupported language" });

  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      { source_code: code, language_id, stdin: stdin || "" },
      {
        headers: {
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json"
        }
      }
    );

    const { stdout, stderr, compile_output } = response.data;
    let output = stdout || stderr || compile_output || "No output";

    if (output.trim() === "" && !stderr && !compile_output) {
      output = "Success ✅";
    }

    res.json({ output });
  } catch (err) {
    console.error("Code execution error:", err.message);
    res.status(500).json({ output: "Error running code. Check your code or API key." });
  }
};
