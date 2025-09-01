// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// const ProblemsManagement = () => {
//   const [problems, setProblems] = useState([]);
//   const [form, setForm] = useState({
//     title: '',
//     description: '',
//     difficulty: 'Easy',
//     tags: '',
//     constraints: '',
//     solution: '',
//     examples: '',
//     testCases: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [editId, setEditId] = useState(null);

//   // Fetch all problems
//   const fetchProblems = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/admin/problems', {
//         withCredentials: true
//       });
//       setProblems(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch problems');
//     }
//   };

//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const buildPayload = () => {
//     return {
//       title: form.title,
//       description: form.description,
//       difficulty: form.difficulty,
//       tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()) : [],
//       constraints: form.constraints,
//       solution: form.solution,
//       examples: form.examples
//         ? form.examples.split('\n').map((line) => {
//             const [input, output, explanation] = line.split('|');
//             return { input: input?.trim(), output: output?.trim(), explanation: explanation?.trim() };
//           })
//         : [],
//       testCases: form.testCases
//         ? form.testCases.split('\n').map((line) => {
//             const [input, expectedOutput] = line.split('|');
//             return { input: input?.trim(), expectedOutput: expectedOutput?.trim() };
//           })
//         : []
//     };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = buildPayload();

//       if (editId) {
//         await axios.put(`http://localhost:5000/api/admin/problems/${editId}`, payload, {
//           withCredentials: true
//         });
//         toast.success('Problem updated successfully');
//       } else {
//         await axios.post('http://localhost:5000/api/admin/problems', payload, {
//           withCredentials: true
//         });
//         toast.success('Problem added successfully');
//       }

//       setForm({
//         title: '',
//         description: '',
//         difficulty: 'Easy',
//         tags: '',
//         constraints: '',
//         solution: '',
//         examples: '',
//         testCases: ''
//       });
//       setEditId(null);
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || 'Failed to save problem');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (problem) => {
//     setEditId(problem._id);
//     setForm({
//       title: problem.title,
//       description: problem.description,
//       difficulty: problem.difficulty,
//       tags: problem.tags.join(', '),
//       constraints: problem.constraints || '',
//       solution: problem.solution || '',
//       examples: problem.examples
//         .map((ex) => `${ex.input}|${ex.output}|${ex.explanation}`)
//         .join('\n'),
//       testCases: problem.testCases
//         .map((tc) => `${tc.input}|${tc.expectedOutput}`)
//         .join('\n')
//     });
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this problem?')) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/admin/problems/${id}`, {
//         withCredentials: true
//       });
//       toast.success('Problem deleted successfully');
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to delete problem');
//     }
//   };

//   return (
//     <div className="p-6 bg-black min-h-screen">
//       <h2 className="text-2xl font-bold mb-6 text-green-400">Problems Management</h2>

//       {/* Add/Edit Problem Form */}
//       <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
//         <input
//           type="text"
//           name="title"
//           placeholder="Title"
//           value={form.title}
//           onChange={handleChange}
//           required
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <textarea
//           name="description"
//           placeholder="Description"
//           value={form.description}
//           onChange={handleChange}
//           required
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <select
//           name="difficulty"
//           value={form.difficulty}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         >
//           <option>Easy</option>
//           <option>Medium</option>
//           <option>Hard</option>
//         </select>
//         <input
//           type="text"
//           name="tags"
//           placeholder="Tags (comma separated)"
//           value={form.tags}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <input
//           type="text"
//           name="constraints"
//           placeholder="Constraints"
//           value={form.constraints}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <textarea
//           name="solution"
//           placeholder="Solution"
//           value={form.solution}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <textarea
//           name="examples"
//           placeholder="Examples (each line: input|output|explanation)"
//           value={form.examples}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <textarea
//           name="testCases"
//           placeholder="Test Cases (each line: input|expectedOutput)"
//           value={form.testCases}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 font-semibold"
//         >
//           {loading ? (editId ? 'Updating...' : 'Adding...') : editId ? 'Update Problem' : 'Add Problem'}
//         </button>
//         {editId && (
//           <button
//             type="button"
//             onClick={() => {
//               setEditId(null);
//               setForm({
//                 title: '',
//                 description: '',
//                 difficulty: 'Easy',
//                 tags: '',
//                 constraints: '',
//                 solution: '',
//                 examples: '',
//                 testCases: ''
//               });
//             }}
//             className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-semibold"
//           >
//             Cancel Edit
//           </button>
//         )}
//       </form>

//       {/* List of Problems */}
//       <div className="overflow-x-auto flex flex-col gap-4">
//         {problems.map((p) => (
//           <div
//             key={p._id}
//             className="p-4 bg-black border border-green-500 rounded text-white flex flex-col gap-2"
//           >
//             <h3 className="font-bold text-green-400">{p.title}</h3>
//             <p>{p.description}</p>
//             <p className="text-sm text-green-400">Difficulty: {p.difficulty}</p>
//             <p className="text-sm text-green-400">
//               Tags: {p.tags && p.tags.length > 0 ? p.tags.join(', ') : 'None'}
//             </p>
//             <div className="flex gap-3 mt-2">
//               <button
//                 onClick={() => handleEdit(p)}
//                 className="bg-green-500 text-black px-3 py-1 rounded hover:bg-green-600"
//               >
//                 Edit
//               </button>
//               <button
//                 onClick={() => handleDelete(p._id)}
//                 className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//         {problems.length === 0 && (
//           <p className="text-gray-400">No problems added yet.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProblemsManagement;





// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// const ProblemsManagement = () => {
//   const [problems, setProblems] = useState([]);
//   const [form, setForm] = useState({
//     title: '',
//     functionName: 'solve',
//     inputSignature: 'string',
//     description: '',
//     difficulty: 'Easy',
//     tags: '',
//     constraints: '',
//     solution: '',
//     examples: '',
//     testCases: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [editId, setEditId] = useState(null);

//   // ✅ Fetch all problems
//   const fetchProblems = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/admin/problems', {
//         withCredentials: true
//       });
//       setProblems(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch problems');
//     }
//   };

//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // ✅ Build Payload for API
//   const buildPayload = () => {
//     return {
//       title: form.title.trim(),
//       functionName: (form.functionName || 'solve').trim(),
//       inputSignature: (form.inputSignature || 'string').trim(),
//       description: form.description.trim(),
//       difficulty: form.difficulty,
//       tags: form.tags ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
//       constraints: form.constraints.trim() || '',
//       solution: form.solution.trim() || '',
//       examples: form.examples
//         ? form.examples.split('\n').map((line) => {
//             const [input, output, explanation] = line.split('|');
//             return {
//               input: input?.trim() || '',
//               output: output?.trim() || '',
//               explanation: explanation?.trim() || ''
//             };
//           }).filter(ex => ex.input && ex.output)
//         : [],
//       testCases: form.testCases
//         ? form.testCases.split('\n').map((line) => {
//             const [input, expectedOutput] = line.split('|');
//             return {
//               input: input?.trim() || '',
//               expectedOutput: expectedOutput?.trim() || ''
//             };
//           }).filter(tc => tc.input && tc.expectedOutput)
//         : []
//     };
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = buildPayload();

//       if (!payload.title || !payload.description) {
//         toast.error('Title and description are required');
//         setLoading(false);
//         return;
//       }

//       if (editId) {
//         await axios.put(`http://localhost:5000/api/admin/problems/${editId}`, payload, {
//           withCredentials: true
//         });
//         toast.success('Problem updated successfully');
//       } else {
//         await axios.post('http://localhost:5000/api/admin/problems', payload, {
//           withCredentials: true
//         });
//         toast.success('Problem added successfully');
//       }

//       resetForm();
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || 'Failed to save problem');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       title: '',
//       functionName: 'solve',
//       inputSignature: 'string',
//       description: '',
//       difficulty: 'Easy',
//       tags: '',
//       constraints: '',
//       solution: '',
//       examples: '',
//       testCases: ''
//     });
//     setEditId(null);
//   };

//   const handleEdit = (problem) => {
//     setEditId(problem._id);
//     setForm({
//       title: problem.title,
//       functionName: problem.functionName || 'solve',
//       inputSignature: problem.inputSignature || 'string',
//       description: problem.description,
//       difficulty: problem.difficulty,
//       tags: problem.tags.join(', '),
//       constraints: problem.constraints || '',
//       solution: problem.solution || '',
//       examples: problem.examples
//         .map((ex) => `${ex.input}|${ex.output}|${ex.explanation}`)
//         .join('\n'),
//       testCases: problem.testCases
//         .map((tc) => `${tc.input}|${tc.expectedOutput}`)
//         .join('\n')
//     });
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this problem?')) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/admin/problems/${id}`, {
//         withCredentials: true
//       });
//       toast.success('Problem deleted successfully');
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to delete problem');
//     }
//   };

//   return (
//     <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
//       <h2 className="text-2xl font-bold mb-6 text-green-400">Problems Management</h2>

//       {/* ✅ Add/Edit Problem Form */}
//       <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
//         <input
//           type="text"
//           name="title"
//           placeholder="Title"
//           value={form.title}
//           onChange={handleChange}
//           required
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//           <input
//             type="text"
//             name="functionName"
//             placeholder="Function name e.g. twoSum, isPalindrome"
//             value={form.functionName}
//             onChange={handleChange}
//             className="p-2 rounded bg-black border border-green-500 text-white"
//           />
//           <input
//             type="text"
//             name="inputSignature"
//             placeholder="Input signature hint e.g. number[], string"
//             value={form.inputSignature}
//             onChange={handleChange}
//             className="p-2 rounded bg-black border border-green-500 text-white"
//           />
//         </div>
//         <textarea
//           name="description"
//           placeholder="Description"
//           value={form.description}
//           onChange={handleChange}
//           required
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <select
//           name="difficulty"
//           value={form.difficulty}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         >
//           <option>Easy</option>
//           <option>Medium</option>
//           <option>Hard</option>
//         </select>
//         <input
//           type="text"
//           name="tags"
//           placeholder="Tags (comma separated)"
//           value={form.tags}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <input
//           type="text"
//           name="constraints"
//           placeholder="Constraints"
//           value={form.constraints}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <textarea
//           name="solution"
//           placeholder="Solution (JS code or explanation)"
//           value={form.solution}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <textarea
//           name="examples"
//           placeholder="Examples (each line: input|output|explanation)"
//           value={form.examples}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <textarea
//           name="testCases"
//           placeholder="Test Cases (each line: input|expectedOutput)"
//           value={form.testCases}
//           onChange={handleChange}
//           className="p-2 rounded bg-black border border-green-500 text-white"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 font-semibold"
//         >
//           {loading ? (editId ? 'Updating...' : 'Adding...') : editId ? 'Update Problem' : 'Add Problem'}
//         </button>
//         {editId && (
//           <button
//             type="button"
//             onClick={resetForm}
//             className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-semibold"
//           >
//             Cancel Edit
//           </button>
//         )}
//       </form>

//       {/* ✅ Problems List */}
//       <div className="overflow-x-auto flex flex-col gap-4">
//         {problems.map((p) => (
//           <div
//             key={p._id}
//             className="p-4 bg-black border border-green-500 rounded text-white flex flex-col gap-2"
//           >
//             <h3 className="font-bold text-green-400">{p.title}</h3>
//             <p>{p.description}</p>
//             <p className="text-sm text-green-400">Difficulty: {p.difficulty}</p>
//             <p className="text-sm text-green-400">
//               Tags: {p.tags && p.tags.length > 0 ? p.tags.join(', ') : 'None'}
//             </p>
//             <div className="flex gap-3 mt-2">
//               <button
//                 onClick={() => handleEdit(p)}
//                 className="bg-green-500 text-black px-3 py-1 rounded hover:bg-green-600"
//               >
//                 Edit
//               </button>
//               <button
//                 onClick={() => handleDelete(p._id)}
//                 className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//         {problems.length === 0 && (
//           <p className="text-gray-400">No problems added yet.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProblemsManagement;



// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// const ProblemsManagement = () => {
//   const [problems, setProblems] = useState([]);
//   const [form, setForm] = useState({
//     title: '',
//     functionName: 'solve',
//     inputSignature: 'string',
//     description: '',
//     difficulty: 'Easy',
//     tags: '',
//     constraints: '',
//     solution: '',
//     examples: '',
//     testCases: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [editId, setEditId] = useState(null);

//   // ✅ Get JWT token
//   const token = localStorage.getItem('token');

//   const axiosConfig = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     },
//     withCredentials: true
//   };

//   // Fetch all problems
//   const fetchProblems = async () => {
//     try {
//       const res = await axios.get('http://localhost:5000/api/admin/problems', axiosConfig);
//       setProblems(res.data);
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to fetch problems');
//     }
//   };

//   useEffect(() => {
//     fetchProblems();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const buildPayload = () => ({
//     title: form.title.trim(),
//     functionName: (form.functionName || 'solve').trim(),
//     inputSignature: (form.inputSignature || 'string').trim(),
//     description: form.description.trim(),
//     difficulty: form.difficulty,
//     tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
//     constraints: form.constraints.trim() || '',
//     solution: form.solution.trim() || '',
//     examples: form.examples
//       ? form.examples.split('\n').map(line => {
//           const [input, output, explanation] = line.split('|');
//           return {
//             input: input?.trim() || '',
//             output: output?.trim() || '',
//             explanation: explanation?.trim() || ''
//           };
//         }).filter(ex => ex.input && ex.output)
//       : [],
//     testCases: form.testCases
//       ? form.testCases.split('\n').map(line => {
//           const [input, expectedOutput] = line.split('|');
//           return {
//             input: input?.trim() || '',
//             expectedOutput: expectedOutput?.trim() || ''
//           };
//         }).filter(tc => tc.input && tc.expectedOutput)
//       : []
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const payload = buildPayload();
//       if (!payload.title || !payload.description) {
//         toast.error('Title and description are required');
//         setLoading(false);
//         return;
//       }

//       if (editId) {
//         await axios.put(`http://localhost:5000/api/admin/problems/${editId}`, payload, axiosConfig);
//         toast.success('Problem updated successfully');
//       } else {
//         await axios.post('http://localhost:5000/api/admin/problems', payload, axiosConfig);
//         toast.success('Problem added successfully');
//       }

//       resetForm();
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || 'Failed to save problem');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       title: '',
//       functionName: 'solve',
//       inputSignature: 'string',
//       description: '',
//       difficulty: 'Easy',
//       tags: '',
//       constraints: '',
//       solution: '',
//       examples: '',
//       testCases: ''
//     });
//     setEditId(null);
//   };

//   const handleEdit = (problem) => {
//     setEditId(problem._id);
//     setForm({
//       title: problem.title,
//       functionName: problem.functionName || 'solve',
//       inputSignature: problem.inputSignature || 'string',
//       description: problem.description,
//       difficulty: problem.difficulty,
//       tags: problem.tags.join(', '),
//       constraints: problem.constraints || '',
//       solution: problem.solution || '',
//       examples: problem.examples.map(ex => `${ex.input}|${ex.output}|${ex.explanation}`).join('\n'),
//       testCases: problem.testCases.map(tc => `${tc.input}|${tc.expectedOutput}`).join('\n')
//     });
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this problem?')) return;
//     try {
//       await axios.delete(`http://localhost:5000/api/admin/problems/${id}`, axiosConfig);
//       toast.success('Problem deleted successfully');
//       fetchProblems();
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to delete problem');
//     }
//   };

//   return (
//     <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">
//       <h2 className="text-2xl font-bold mb-6 text-green-400">Problems Management</h2>

//       <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
//         <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="p-2 rounded bg-black border border-green-500 text-white" />
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//           <input type="text" name="functionName" placeholder="Function name e.g. twoSum" value={form.functionName} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white" />
//           <input type="text" name="inputSignature" placeholder="Input signature e.g. number[]" value={form.inputSignature} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white" />
//         </div>
//         <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="p-2 rounded bg-black border border-green-500 text-white" />
//         <select name="difficulty" value={form.difficulty} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white">
//           <option>Easy</option>
//           <option>Medium</option>
//           <option>Hard</option>
//         </select>
//         <input type="text" name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white" />
//         <input type="text" name="constraints" placeholder="Constraints" value={form.constraints} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white" />
//         <textarea name="solution" placeholder="Solution (JS code or explanation)" value={form.solution} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white" />
//         <textarea name="examples" placeholder="Examples (input|output|explanation)" value={form.examples} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white" />
//         <textarea name="testCases" placeholder="Test Cases (input|expectedOutput)" value={form.testCases} onChange={handleChange} className="p-2 rounded bg-black border border-green-500 text-white" />
//         <button type="submit" disabled={loading} className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 font-semibold">
//           {loading ? (editId ? 'Updating...' : 'Adding...') : editId ? 'Update Problem' : 'Add Problem'}
//         </button>
//         {editId && <button type="button" onClick={resetForm} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 font-semibold">Cancel Edit</button>}
//       </form>

//       <div className="overflow-x-auto flex flex-col gap-4">
//         {problems.map((p) => (
//           <div key={p._id} className="p-4 bg-black border border-green-500 rounded text-white flex flex-col gap-2">
//             <h3 className="font-bold text-green-400">{p.title}</h3>
//             <p>{p.description}</p>
//             <p className="text-sm text-green-400">Difficulty: {p.difficulty}</p>
//             <p className="text-sm text-green-400">Tags: {p.tags.length > 0 ? p.tags.join(', ') : 'None'}</p>
//             <div className="flex gap-3 mt-2">
//               <button onClick={() => handleEdit(p)} className="bg-green-500 text-black px-3 py-1 rounded hover:bg-green-600">Edit</button>
//               <button onClick={() => handleDelete(p._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
//             </div>
//           </div>
//         ))}
//         {problems.length === 0 && <p className="text-gray-400">No problems added yet.</p>}
//       </div>
//     </div>
//   );
// };

// export default ProblemsManagement;





import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProblemsManagement = () => {
  const [problems, setProblems] = useState([]);
  const [form, setForm] = useState({
    title: '',
    functionName: 'solve',
    inputSignature: 'string',
    description: '',
    difficulty: 'Easy',
    tags: '',
    constraints: '',
    solution: '',
    examples: '',
    testCases: ''
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    withCredentials: true
  };

  const fetchProblems = async () => {
    try {
      const res = await axios.get('https://devarena-leetcode-2.onrender.com/api/admin/problems', axiosConfig);
      setProblems(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch problems');
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    functionName: (form.functionName || 'solve').trim(),
    inputSignature: (form.inputSignature || 'string').trim(),
    description: form.description.trim(),
    difficulty: form.difficulty,
    tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    constraints: form.constraints.trim() || '',
    solution: form.solution.trim() || '',
    examples: form.examples
      ? form.examples.split('\n').map(line => {
          const [input, output, explanation] = line.split('|');
          return {
            input: input?.trim() || '',
            output: output?.trim() || '',
            explanation: explanation?.trim() || ''
          };
        }).filter(ex => ex.input && ex.output)
      : [],
    testCases: form.testCases
      ? form.testCases.split('\n').map(line => {
          const [input, expectedOutput] = line.split('|');
          return {
            input: input?.trim() || '',
            expectedOutput: expectedOutput?.trim() || ''
          };
        }).filter(tc => tc.input && tc.expectedOutput)
      : []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = buildPayload();
      if (!payload.title || !payload.description) {
        toast.error('Title and description are required');
        setLoading(false);
        return;
      }

      if (editId) {
        await axios.put(`https://devarena-leetcode-2.onrender.com/api/admin/problems/${editId}`, payload, axiosConfig);
        toast.success('Problem updated successfully');
      } else {
        await axios.post('https://devarena-leetcode-2.onrender.com/api/admin/problems', payload, axiosConfig);
        toast.success('Problem added successfully');
      }

      resetForm();
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      functionName: 'solve',
      inputSignature: 'string',
      description: '',
      difficulty: 'Easy',
      tags: '',
      constraints: '',
      solution: '',
      examples: '',
      testCases: ''
    });
    setEditId(null);
  };

  const handleEdit = (problem) => {
    setEditId(problem._id);
    setForm({
      title: problem.title,
      functionName: problem.functionName || 'solve',
      inputSignature: problem.inputSignature || 'string',
      description: problem.description,
      difficulty: problem.difficulty,
      tags: problem.tags.join(', '),
      constraints: problem.constraints || '',
      solution: problem.solution || '',
      examples: problem.examples.map(ex => `${ex.input}|${ex.output}|${ex.explanation}`).join('\n'),
      testCases: problem.testCases.map(tc => `${tc.input}|${tc.expectedOutput}`).join('\n')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      await axios.delete(`https://devarena-leetcode-2.onrender.com/api/admin/problems/${id}`, axiosConfig);
      toast.success('Problem deleted successfully');
      fetchProblems();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete problem');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6 text-green-400 text-center">🚀 Problems Management</h2>

      {/* ✅ Problem Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
        {/* Title */}
        <input
          type="text"
          name="title"
          placeholder="Enter Problem Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-black border border-green-500 focus:ring-2 focus:ring-green-400 text-white placeholder-gray-400"
        />

        {/* Function Name & Input Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="functionName"
            placeholder="Function name (e.g., twoSum)"
            value={form.functionName}
            onChange={handleChange}
            className="p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
          />
          <input
            type="text"
            name="inputSignature"
            placeholder="Input signature (e.g., number[])"
            value={form.inputSignature}
            onChange={handleChange}
            className="p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
          />
        </div>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Enter problem description..."
          value={form.description}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
          rows="3"
        />

        {/* Difficulty */}
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="p-3 rounded bg-black border border-green-500 text-white"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

        {/* Tags */}
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated, e.g., array, sorting)"
          value={form.tags}
          onChange={handleChange}
          className="p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
        />

        {/* Constraints */}
        <input
          type="text"
          name="constraints"
          placeholder="Constraints (e.g., 1 <= n <= 10^5)"
          value={form.constraints}
          onChange={handleChange}
          className="p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
        />

        {/* Solution */}
        <textarea
          name="solution"
          placeholder="Solution (JS code or explanation)"
          value={form.solution}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
          rows="4"
        />

        {/* Examples */}
        <textarea
          name="examples"
          placeholder="Examples (one per line: input|output|explanation)"
          value={form.examples}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
          rows="3"
        />

        {/* Test Cases */}
        <textarea
          name="testCases"
          placeholder="Test Cases (one per line: input|expectedOutput)"
          value={form.testCases}
          onChange={handleChange}
          className="w-full p-3 rounded bg-black border border-green-500 text-white placeholder-gray-400"
          rows="3"
        />

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-black px-6 py-3 rounded font-bold hover:bg-green-600 transition duration-200"
          >
            {loading ? (editId ? 'Updating...' : 'Adding...') : editId ? 'Update Problem' : 'Add Problem'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-600 text-white px-6 py-3 rounded font-bold hover:bg-gray-700 transition duration-200"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* ✅ Problems List */}
      {/* ✅ Problems List */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {problems.map((p) => (
    <div
      key={p._id}
      className="p-6 bg-gray-900 border border-green-500 rounded-lg shadow-lg flex flex-col gap-3 hover:scale-[1.02] transition"
    >
      <h3 className="text-xl font-bold text-green-400">{p.title}</h3>
      <p className="text-gray-300">{p.description}</p>
      <p className="text-sm text-green-400">Difficulty: {p.difficulty}</p>
      <p className="text-sm text-green-400">Tags: {p.tags.length > 0 ? p.tags.join(', ') : 'None'}</p>
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => handleEdit(p)}
          className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(p._id)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  ))}
  {problems.length === 0 && <p className="text-gray-400">No problems added yet.</p>}
</div>

    </div>
  );
};

export default ProblemsManagement;

