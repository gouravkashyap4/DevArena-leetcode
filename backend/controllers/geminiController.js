// // import fetch from "node-fetch";

// // export const askGemini = async (req, res) => {
// //   const { problemTitle, problemDescription, userCode, questionType } = req.body;

// //   if (!problemTitle && !problemDescription && !userCode) {
// //     return res.status(400).json({ error: "At least one field is required" });
// //   }

// //   try {
// //     // Build prompt
// //     let prompt = "";
// //     if (questionType === "hint") {
// //       prompt = `Give a hint for this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}`;
// //     } else if (questionType === "explanation") {
// //       prompt = `Explain the following solution:\n${userCode}`;
// //     } else {
// //       prompt = `Answer user question about this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}\nCode: ${userCode || "N/A"}`;
// //     }

// //     const response = await fetch(
// //       `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${process.env.GEMINI_API_KEY}`,
// //       {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           prompt: { text: prompt },
// //           temperature: 0.7,
// //           candidate_count: 1,
// //           max_output_tokens: 256
// //         })
// //       }
// //     );

// //     const response = await fetch(
// //       `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${process.env.GEMINI_API_KEY}`,
// //       {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           prompt: { text: prompt },
// //           temperature: 0.7,
// //           candidate_count: 1,
// //           max_output_tokens: 256
// //         })
// //       }
// //     );

// //     const data = await response.json();
// //     console.log("Full Gemini response:", JSON.stringify(data, null, 2));

// //     const reply = data.candidates?.[0]?.output || "No response from Gemini";
// //     res.json({ reply });
// //   } catch (error) {
// //     console.error("Gemini API Error:", error.message);
// //     res.status(500).json({ error: "Error contacting Gemini API" });
// //   }
// // };



// import fetch from "node-fetch";

// export const askGemini = async (req, res) => {
//   const { problemTitle, problemDescription, userCode, questionType } = req.body;

//   if (!problemTitle && !problemDescription && !userCode) {
//     return res.status(400).json({ error: "At least one field is required" });
//   }

//   try {
//     let prompt = "";
//     if (questionType === "hint") {
//       prompt = `Give a hint for this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}`;
//     } else if (questionType === "explanation") {
//       prompt = `Explain the following solution:\n${userCode}`;
//     } else {
//       prompt = `Answer user question about this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}\nCode: ${userCode || "N/A"}`;
//     }

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           prompt: { text: prompt },
//           temperature: 0.7,
//           candidate_count: 1,
//           max_output_tokens: 256
//         })
//       }
//     );

//     const data = await response.json();
//     console.log("Full Gemini response:", JSON.stringify(data, null, 2));

//     const reply = data.candidates?.[0]?.output || "No response from Gemini";
//     res.json({ reply });
//   } catch (error) {
//     console.error("Gemini API Error:", error.message);
//     res.status(500).json({ error: "Error contacting Gemini API" });
//   }
// };



// import fetch from "node-fetch";

// // POST /api/gemini/ask
// export const askGemini = async (req, res) => {
//   const { problemTitle, problemDescription, userCode, questionType } = req.body;

//   if (!problemTitle && !problemDescription && !userCode) {
//     return res.status(400).json({ error: "At least one field is required" });
//   }

//   try {
//     // Build prompt based on question type
//     let prompt = "";
//     if (questionType === "hint") {
//       prompt = `Give a hint for this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}`;
//     } else if (questionType === "explanation") {
//       prompt = `Explain the following solution:\n${userCode}`;
//     } else {
//       prompt = `Answer user question about this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}\nCode: ${userCode || "N/A"}`;
//     }

//     // Gemini API payload (using Gemini 2.0 Flash)
//     const payload = {
//       "contents": [
//         { "parts": [{ "text": prompt }] }
//       ]
//     };

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(payload)
//       }
//     );

//     const data = await response.json();
//     console.log("Full Gemini response:", JSON.stringify(data, null, 2));

//     // Extract reply from Gemini response
//     const reply = data?.candidates?.[0]?.content?.[0]?.text || "No response from Gemini";

//     res.json({ reply });
//   } catch (error) {
//     console.error("Gemini API Error:", error.message);
//     res.status(500).json({ error: "Error contacting Gemini API" });
//   }
// };




import fetch from "node-fetch";

export const askGemini = async (req, res) => {
  const { problemTitle, problemDescription, userCode, questionType, customQuestion } = req.body;

  // For general chat, only customQuestion is required
  if (questionType === "general") {
    if (!customQuestion || !customQuestion.trim()) {
      return res.status(400).json({ error: "Question is required for general chat" });
    }
  } else {
    // For other types, require problem context
    if (!problemTitle && !problemDescription && !userCode) {
      return res.status(400).json({ error: "At least one field is required" });
    }
  }

  try {
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return res.status(500).json({ error: "Gemini API key not configured" });
    }

    let prompt = "";
    if (questionType === "general") {
      // For general chat, use the custom question directly
      prompt = customQuestion.trim();
    } else if (questionType === "hint") {
      prompt = `Give a hint for this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}`;
    } else if (questionType === "explanation") {
      prompt = `Explain the following solution:\n${userCode}`;
    } else {
      prompt = `Answer user question about this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}\nCode: ${userCode || "N/A"}`;
    }

    // const response = await fetch(
    //   `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    //   {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       contents: [
    //         {
    //           parts: [
    //             { text: prompt }
    //           ]
    //         }
    //       ]
    //     })
    //   }
    // );



    console.log("Making request to Gemini API...");
    console.log("API Key (first 10 chars):", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    const data = await response.json();
    console.log("Question type:", questionType);
    console.log("Custom question:", customQuestion);
    console.log("Final prompt:", prompt);
    console.log("Full Gemini response:", data);

    // Safe check for response text
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

    res.json({ reply });

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ error: "Error contacting Gemini API" });
  }
};



/////new
// import fetch from "node-fetch";

// export const askGemini = async (req, res) => {
//   const { problemTitle, problemDescription, userCode, questionType } = req.body;

//   if (!problemTitle && !problemDescription && !userCode) {
//     return res.status(400).json({ error: "At least one field is required" });
//   }

//   try {
//     let prompt = "";

//     if (questionType === "general") {
//       // Normal chat mode
//       prompt = customQuestion;  // Sirf user ka text bhejo
//     } else if (questionType === "hint") {
//       prompt = `Give a hint for this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}`;
//     } else if (questionType === "explanation") {
//       prompt = `Explain the following solution:\n${userCode}`;
//     } else {
//       prompt = `Answer user question about this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}\nCode: ${userCode || "N/A"}`;
//     }
//     console.log("questionType:", questionType);
//     console.log("customQuestion:", customQuestion);
//     console.log("Final prompt:", prompt);

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: prompt }],
//             },
//           ],
//         }),
//       }
//     );

//     const data = await response.json();
//     console.log("Full Gemini response:", data);

//     // Extract reply safely
//     const reply =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

//     // ✅ Send response to frontend
//     return res.json({ reply });

//   } catch (error) {
//     console.error("Gemini API Error:", error.message);
//     return res.status(500).json({ error: "Error contacting Gemini API" });
//   }
// };



/// custom
// import fetch from "node-fetch";

// export const askGemini = async (req, res) => {
//   const { problemTitle, problemDescription, userCode, questionType, customQuestion = "" } = req.body;

//   if (!problemTitle && !problemDescription && !userCode && !customQuestion.trim()) {
//     return res.status(400).json({ error: "At least one field or question is required" });
//   }

//   try {
//     let prompt = "";

//     if (questionType === "general" && customQuestion.trim()) {
//       // ✅ Normal chat mode (user just typed something)
//       prompt = customQuestion.trim();
//     } else if (questionType === "hint") {
//       prompt = `Give a hint for this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}`;
//     } else if (questionType === "explanation") {
//       prompt = `Explain the following solution:\n${userCode}`;
//     } else if (customQuestion.trim()) {
//       // ✅ If user typed something even in other modes, use that
//       prompt = customQuestion.trim();
//     } else {
//       // ✅ Default fallback
//       prompt = `Answer user question about this problem:\nTitle: ${problemTitle}\nDescription: ${problemDescription}\nCode: ${userCode || "N/A"}`;
//     }

//     console.log("questionType:", questionType);
//     console.log("customQuestion:", customQuestion);
//     console.log("Final prompt:", prompt);

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: prompt }],
//             },
//           ],
//         }),
//       }
//     );

//     const data = await response.json();
//     console.log("Full Gemini response:", data);

//     const reply =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

//     return res.json({ reply });
//   } catch (error) {
//     console.error("Gemini API Error:", error.message);
//     return res.status(500).json({ error: "Error contacting Gemini API" });
//   }
// };


///bas kudh ke hii
// import fetch from "node-fetch";

// export const askGemini = async (req, res) => {
//   const { customQuestion } = req.body;

//   if (!customQuestion || !customQuestion.trim()) {
//     return res.status(400).json({ error: "Question is required" });
//   }

//   try {
//     const prompt = customQuestion;
//     console.log("Final prompt:", prompt);

//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               role: "user",
//               parts: [{ text: prompt }]
//             }
//           ]
//         }),
//       }
//     );


//     const data = await response.json();
//     console.log("Full Gemini response:", data);

//     if (data.error) {
//       return res.status(500).json({ error: data.error.message });
//     }

//     const reply =
//       data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";

//     return res.json({ reply });
//   } catch (error) {
//     console.error("Gemini API Error:", error.message);
//     return res.status(500).json({ error: "Error contacting Gemini API" });
//   }
// };
