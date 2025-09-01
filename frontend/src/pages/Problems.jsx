import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Problems = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/problems", {
          withCredentials: true,
        });
        setProblems(res.data);
      } catch (err) {
        console.error("Error fetching problems:", err);
        if (err.response && err.response.status === 401) navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [navigate]);

  const handleSolveClick = (problem) => {
    navigate(`/problems/${problem._id}`);
  };

  if (loading)
    return <p className="p-6 text-white text-center">Loading problems...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Problems</h1>

      <div className="overflow-x-auto border border-gray-700 rounded-lg">
        <table className="min-w-full bg-[#1e1e2f] text-left">
          <thead className="bg-[#2a2a3c]">
            <tr>
              <th className="py-3 px-4 text-gray-400 font-medium">#</th>
              <th className="py-3 px-4 text-gray-400 font-medium">Title</th>
              <th className="py-3 px-4 text-gray-400 font-medium">Difficulty</th>
              <th className="py-3 px-4 text-gray-400 font-medium">Tags</th>
              <th className="py-3 px-4 text-gray-400 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {problems.map((problem, index) => (
              <tr
                key={problem._id}
                className="border-b border-gray-700 hover:bg-[#292934] transition-colors"
              >
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4 font-medium">{problem.title}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      problem.difficulty === "Easy"
                        ? "bg-green-600 text-white"
                        : problem.difficulty === "Medium"
                        ? "bg-yellow-500 text-black"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400">{problem.tags.join(", ")}</td>
                <td className="py-3 px-4">
                  <button
                    className="bg-blue-600 py-1 px-3 rounded-xl font-medium hover:bg-blue-700 transition"
                    onClick={() => handleSolveClick(problem)}
                  >
                    Solve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Problems;

