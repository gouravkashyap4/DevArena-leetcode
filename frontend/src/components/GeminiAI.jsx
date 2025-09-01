import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiX, FiMessageCircle, FiUser, FiClock, FiSmartphone } from "react-icons/fi";

const GeminiAI = ({ problemTitle, problemDescription, userCode, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAIRequest = async (e) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: customQuestion,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCustomQuestion("");
    setLoading(true);

    try {
      const payload = {
        customQuestion: userMessage.content,
        questionType: "general"
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/gemini/ask`,
        payload
      );

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: res.data.reply,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: "Error contacting Gemini API",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAIRequest(e);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="w-full max-w-4xl h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          
          {/* Header */}
          <motion.div 
            className="flex justify-between items-center p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
                             <motion.div 
                 className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                 whileHover={{ scale: 1.05, rotate: 5 }}
                 transition={{ type: "spring", stiffness: 400 }}
               >
                 <FiSmartphone className="text-white text-xl" />
               </motion.div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                  Gemini AI
                </h2>
                <p className="text-gray-400 text-sm">Your AI coding assistant</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="w-10 h-10 bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl flex items-center justify-center transition-all duration-200 group"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX className="text-lg group-hover:text-red-400 transition-colors" />
            </motion.button>
          </motion.div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-900/50 to-black/50">
            {messages.length === 0 && (
              <motion.div 
                className="text-center text-gray-400 mt-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <FiMessageCircle className="text-white text-3xl" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">How can I help you today?</h3>
                <p className="text-gray-500">Ask me anything about coding, algorithms, or programming concepts.</p>
              </motion.div>
            )}
            
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300
                  }}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                        : message.type === 'error'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                        : 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border border-gray-600/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-white/20' 
                          : message.type === 'error'
                          ? 'bg-white/20'
                          : 'bg-emerald-500/20'
                      }`}>
                                                 {message.type === 'user' ? (
                           <FiUser className="w-3 h-3 text-white" />
                         ) : message.type === 'error' ? (
                           <FiX className="w-3 h-3 text-white" />
                         ) : (
                           <FiSmartphone className="w-3 h-3 text-emerald-400" />
                         )}
                      </div>
                      <div className="flex-1">
                        <div className="whitespace-pre-line leading-relaxed">{message.content}</div>
                        <div className={`flex items-center gap-2 mt-3 text-xs ${
                          message.type === 'user' ? 'text-emerald-100' : 'text-gray-400'
                        }`}>
                          <FiClock className="w-3 h-3" />
                          {message.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600/50 rounded-2xl px-5 py-4 shadow-lg">
                  <div className="flex items-center gap-3">
                                       <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                     <FiSmartphone className="w-3 h-3 text-emerald-400" />
                   </div>
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <motion.div 
                          className="w-2 h-2 bg-emerald-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-emerald-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-emerald-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-emerald-400 text-sm font-medium">Gemini is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <motion.div 
            className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleAIRequest} className="flex gap-4">
              <motion.div 
                className="flex-1 relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Gemini anything about coding..."
                  className="w-full bg-gray-800/50 text-white border border-gray-600/50 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all duration-200 placeholder-gray-500"
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '120px' }}
                />
              </motion.div>
                             <motion.button
                 type="submit"
                 disabled={loading || !customQuestion.trim()}
                 className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-emerald-500/25 disabled:shadow-none"
                 whileHover={{ scale: 1.05, y: -2 }}
                 whileTap={{ scale: 0.95 }}
               >
                {loading ? (
                  <>
                    <motion.div 
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    <span>Send</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GeminiAI;
