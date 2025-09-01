import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaEye, FaCrown, FaFileUpload, FaEdit, FaSave, FaTimes } from "react-icons/fa";

const PremiumManagement = () => {
  const [premiumList, setPremiumList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "course",
    difficulty: "beginner",
    file: null
  });

  // Fetch all premium content
  const fetchPremium = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/premium`, {
        withCredentials: true,
      });
      setPremiumList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch premium content");
    }
  };



  // Handle file viewing
  const handleViewFile = (item) => {
    console.log('Viewing file:', item);
    setSelectedFile(item);
    setShowFileViewer(true);
  };

  // Get file type for display
  const getFileType = (fileUrl) => {
    if (!fileUrl) return 'unknown';
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) return 'video';
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'document';
    if (['txt'].includes(extension)) return 'text';
    return 'unknown';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };



  useEffect(() => {
    fetchPremium();
  }, []);

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "course",
      difficulty: "beginner",
      file: null
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Please enter a name");
    if (!formData.description.trim()) return toast.error("Please enter a description");
    if (!formData.file) return toast.error("Please select a file");

    setLoading(true);
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("difficulty", formData.difficulty);
    submitData.append("file", formData.file);

    try {
      if (editingId) {
        // Update existing
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/premium/${editingId}`, submitData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Premium content updated successfully!");
      } else {
        // Create new
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/premium`, submitData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Premium content created successfully!");
      }
      
      resetForm();
      fetchPremium();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      category: item.category || "course",
      difficulty: item.difficulty || "beginner",
      file: null
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this premium content?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/premium/${id}`, {
        withCredentials: true,
      });
      toast.success("Premium content deleted successfully!");
      fetchPremium();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "course": return "📚";
      case "workshop": return "🔧";
      case "challenge": return "🏆";
      case "resource": return "📖";
      default: return "📄";
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "text-green-400";
      case "intermediate": return "text-yellow-400";
      case "advanced": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Premium Content Management</h2>
          <p className="text-gray-400 mt-1">Create and manage premium learning resources</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
            Add Premium Content
          </motion.button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {editingId ? "Edit Premium Content" : "Add New Premium Content"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Advanced JavaScript Course"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="course">Course</option>
                    <option value="workshop">Workshop</option>
                    <option value="challenge">Challenge</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this premium content offers..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingId ? <FaSave /> : <FaPlus />}
                      {editingId ? "Update Content" : "Create Content"}
                    </>
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
                 )}
       </AnimatePresence>

       {/* File Viewer Modal */}
       <AnimatePresence>
         {showFileViewer && selectedFile && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowFileViewer(false)}
           >
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
               onClick={(e) => e.stopPropagation()}
             >
               {/* Header */}
               <div className="flex items-center justify-between p-4 border-b border-gray-700">
                 <div>
                   <h3 className="text-lg font-semibold text-white">{selectedFile.name}</h3>
                   <p className="text-sm text-gray-400">
                     {selectedFile.fileName} • {formatFileSize(selectedFile.fileSize)} • {selectedFile.fileType}
                   </p>
                 </div>
                 <button
                   onClick={() => setShowFileViewer(false)}
                   className="text-gray-400 hover:text-white transition-colors p-2"
                 >
                   <FaTimes size={20} />
                 </button>
               </div>

               {/* File Content */}
               <div className="p-4 max-h-[70vh] overflow-auto">
                 {getFileType(selectedFile.fileUrl) === 'image' && (
                   <div className="text-center">
                     <img
                       src={selectedFile.fileUrl}
                       alt={selectedFile.name}
                       className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg"
                       onError={(e) => {
                         console.error('Image load error:', e);
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'block';
                       }}
                     />
                     <div className="hidden text-red-400 mt-2">
                       Failed to load image. <a href={selectedFile.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Open in new tab</a>
                     </div>
                   </div>
                 )}

                 {getFileType(selectedFile.fileUrl) === 'video' && (
                   <div className="text-center">
                     <video
                       controls
                       className="max-w-full max-h-[60vh] mx-auto rounded-lg"
                       onError={(e) => {
                         console.error('Video load error:', e);
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'block';
                       }}
                     >
                       <source src={selectedFile.fileUrl} type={selectedFile.fileType} />
                       Your browser does not support the video tag.
                     </video>
                     <div className="hidden text-red-400 mt-2">
                       Failed to load video. <a href={selectedFile.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Open in new tab</a>
                     </div>
                   </div>
                 )}

                 {getFileType(selectedFile.fileUrl) === 'pdf' && (
                   <div className="text-center">
                     <iframe
                       src={selectedFile.fileUrl}
                       className="w-full h-[60vh] border-0 rounded-lg"
                       title={selectedFile.name}
                       onError={(e) => {
                         console.error('PDF load error:', e);
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'block';
                       }}
                     />
                     <div className="hidden text-red-400 mt-2">
                       Failed to load PDF. <a href={selectedFile.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Open in new tab</a>
                     </div>
                   </div>
                 )}

                 {getFileType(selectedFile.fileUrl) === 'document' && (
                   <div className="text-center">
                     <div className="bg-gray-700 p-8 rounded-lg">
                       <div className="text-6xl mb-4">📄</div>
                       <p className="text-white mb-4">Document Preview Not Available</p>
                       <a
                         href={selectedFile.fileUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                       >
                         Download & Open
                       </a>
                     </div>
                   </div>
                 )}

                 {getFileType(selectedFile.fileUrl) === 'text' && (
                   <div className="bg-gray-700 p-4 rounded-lg">
                     <pre className="text-white text-sm whitespace-pre-wrap overflow-auto max-h-[60vh]">
                       {selectedFile.content || 'Text content not available'}
                     </pre>
                   </div>
                 )}

                 {getFileType(selectedFile.fileUrl) === 'unknown' && (
                   <div className="text-center">
                     <div className="bg-gray-700 p-8 rounded-lg">
                       <div className="text-6xl mb-4">❓</div>
                       <p className="text-white mb-4">File type not supported for preview</p>
                       <a
                         href={selectedFile.fileUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                       >
                         Download & Open
                       </a>
                     </div>
                   </div>
                 )}
               </div>

               {/* Footer */}
               <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                 <div className="flex items-center justify-between">
                   <div className="text-sm text-gray-400">
                     <span>Category: {selectedFile.category}</span>
                     <span className="mx-2">•</span>
                     <span>Difficulty: {selectedFile.difficulty}</span>
                   </div>
                   <div className="flex gap-2">
                     <a
                       href={selectedFile.fileUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                     >
                       Open in New Tab
                     </a>
                     <button
                       onClick={() => setShowFileViewer(false)}
                       className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                     >
                       Close
                     </button>
                   </div>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Premium Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {premiumList.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                <div>
                  <h3 className="font-semibold text-white">{item.name || "Untitled Content"}</h3>
                  <p className={`text-sm ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty?.charAt(0).toUpperCase() + item.difficulty?.slice(1) || "Beginner"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

                         <p className="text-gray-400 text-sm mb-4 line-clamp-2">
               {item.description || "No description available"}
             </p>

             {/* File Information */}
             <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
               <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                 <span>📁 {item.fileName || 'Unknown file'}</span>
                 <span>{formatFileSize(item.fileSize)}</span>
               </div>
               <div className="text-xs text-gray-500">
                 Type: {item.fileType || 'Unknown'} • Uploaded: {new Date(item.createdAt).toLocaleDateString()}
               </div>
             </div>

                         <div className="flex items-center justify-between">
               <span className="text-xs text-gray-500 uppercase tracking-wide">
                 {item.category || "course"}
               </span>
               {item.fileUrl && (
                 <button
                   onClick={() => handleViewFile(item)}
                   className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1 transition-colors hover:underline"
                 >
                   <FaEye />
                   View File
                 </button>
               )}
             </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {premiumList.length === 0 && !showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">👑</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Premium Content Yet</h3>
          <p className="text-gray-400 mb-6">Start creating premium learning resources for your users</p>
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto hover:from-green-600 hover:to-green-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus />
            Create Your First Premium Content
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default PremiumManagement;
