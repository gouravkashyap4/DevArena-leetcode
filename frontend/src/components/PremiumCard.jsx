import React from "react";
import { motion } from "framer-motion";
import { FiFileText, FiLock, FiPlay, FiStar, FiTrendingUp, FiBook } from "react-icons/fi";

const PremiumCard = ({ item, onDelete, onCardClick, isLoggedIn, isPremium }) => {
  // Debug logging
  console.log('PremiumCard received item:', {
    id: item._id,
    name: item.name,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileType: item.fileType
  });
  
  const getFileType = (url) => {
    if (!url) return "file";
    if (url.endsWith(".pdf")) return "pdf";
    if (url.endsWith(".mp4") || url.endsWith(".mov")) return "video";
    if (url.match(/\.(jpeg|jpg|png|gif|webp)$/)) return "image";
    return "file";
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "course": return <FiBook className="text-blue-400" />;
      case "workshop": return <FiTrendingUp className="text-green-400" />;
      case "challenge": return <FiStar className="text-yellow-400" />;
      case "resource": return <FiFileText className="text-purple-400" />;
      default: return <FiFileText className="text-gray-400" />;
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

  const type = getFileType(item.fileUrl);

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(item);
    }
  };

  const handleFileOpen = (e) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    
    if (!item.fileUrl) {
      console.error('No file URL available');
      return;
    }
    
    // Check if the URL is valid (not localhost)
    if (item.fileUrl.includes('localhost') || item.fileUrl.startsWith('/uploads/')) {
      console.error('Invalid file URL:', item.fileUrl);
      alert('File URL is invalid. Please contact admin to fix this.');
      return;
    }
    
    // Open the file based on type
    if (type === 'video' || type === 'image') {
      // For videos and images, open in new tab
      window.open(item.fileUrl, '_blank');
    } else if (type === 'pdf') {
      // For PDFs, open in new tab
      window.open(item.fileUrl, '_blank');
    } else {
      // For other files, try to download
      const link = document.createElement('a');
      link.href = item.fileUrl;
      link.download = item.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <motion.div
      className="relative bg-black/80 backdrop-blur-md shadow-lg rounded-3xl p-5 flex flex-col justify-between border border-green-700 hover:border-green-500 transition-all duration-300 group cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(34,197,94,0.5)" }}
      onClick={handleCardClick}
    >
      {/* Lock Overlay for Non-logged in or Non-premium users */}
      {(!isLoggedIn || !isPremium) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10 group-hover:bg-black/70 transition-all duration-300"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="text-green-400 text-2xl" />
            </div>
            {!isLoggedIn ? (
              <>
                <p className="text-green-400 font-semibold text-lg">Login Required</p>
                <p className="text-gray-300 text-sm mt-1">Click to login</p>
              </>
            ) : (
              <>
                <p className="text-green-400 font-semibold text-lg">Premium Required</p>
                <p className="text-gray-300 text-sm mt-1">Upgrade to access</p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* File Preview */}
      <div className="relative w-full mb-5 rounded-2xl overflow-hidden">
        {type === "pdf" && (
          <div className="flex flex-col items-center justify-center py-14 bg-gradient-to-br from-green-900 to-black">
            <FiFileText size={50} className="text-green-400 mb-3" />
            <span className="text-xl font-bold text-green-300">PDF File</span>
          </div>
        )}
        {type === "video" && (
          <div className="relative">
            <video
              className="w-full h-56 object-cover rounded-2xl shadow-inner"
            >
              <source src={item.fileUrl} type="video/mp4" />
            </video>
            {isLoggedIn && isPremium && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 bg-green-500/80 rounded-full flex items-center justify-center">
                  <FiPlay className="text-white text-2xl ml-1" />
                </div>
              </div>
            )}
          </div>
        )}
        {type === "image" && (
          <div className="relative">
            <img
              src={item.fileUrl}
              alt="premium"
              className="w-full h-56 object-cover rounded-2xl shadow-inner hover:scale-105 transition-transform duration-300"
            />
            {isLoggedIn && isPremium && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 bg-green-500/80 rounded-full flex items-center justify-center">
                  <FiPlay className="text-white text-2xl ml-1" />
                </div>
              </div>
            )}
          </div>
        )}
        {type === "file" && (
          <div className="flex flex-col items-center justify-center py-14 bg-gradient-to-br from-gray-800 to-black">
            <span className="text-green-400 text-sm break-words px-4 text-center">
              {item.fileUrl}
            </span>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="mb-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {item.name || item.title || "Premium Resource"}
        </h3>
        
        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {item.description || "Premium learning resource"}
        </p>

        {/* Category and Difficulty */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(item.category)}
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {item.category || "course"}
            </span>
          </div>
          <span className={`text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
            {item.difficulty?.charAt(0).toUpperCase() + item.difficulty?.slice(1) || "Beginner"}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        {!isLoggedIn ? (
          <div className="w-full bg-gray-700 text-gray-300 px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2">
            <FiLock className="text-lg" />
            Login to Access
          </div>
        ) : !isPremium ? (
          <div className="w-full bg-yellow-600 text-black font-bold px-8 py-3 rounded-full font-semibold flex items-center justify-center gap-2">
            <FiLock className="text-lg" />
            Upgrade to Premium
          </div>
        ) : (
          <button 
            onClick={handleFileOpen}
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-black font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FiPlay className="text-lg" />
            Open File
          </button>
        )}
      </div>

      {/* Premium Badge */}
      <div className="absolute top-4 right-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
          PREMIUM
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumCard;

