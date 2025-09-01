import React, { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaGoogle, FaTimes, FaUser } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const SignupModal = ({ onClose, onSignupSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    capital: false,
    number: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Password validation
    if (name === 'password') {
      setPasswordValidation({
        length: value.length >= 6,
        capital: /[A-Z]/.test(value),
        number: /[0-9]/.test(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Password validation check
    if (!passwordValidation.length || !passwordValidation.capital || !passwordValidation.number) {
      setError("Password must be at least 6 characters long, contain 1 capital letter, and 1 number");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        formData,
        { withCredentials: true }
      );

      const data = res.data;
      console.log("Signup response:", data);

      if (data && data.token) {
        onSignupSuccess(formData.username, data.token);
        toast.success("Account created successfully! 🎉");
      } else {
        throw new Error(data.message || "Signup failed");
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(err.response?.data?.message || "Signup failed");
      toast.error(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (res) => {
    setLoading(true);
    setError("");
    try {
      const idToken = res.credential;
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`,
        { idToken },
        { withCredentials: true }
      );

      if (data && data.user && data.token) {
        onSignupSuccess(data.user.username, data.token);
        toast.success(`Welcome ${data.user.username}! 🚀`);
      } else {
        throw new Error("Invalid Google signup response");
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      setError(err.response?.data?.message || "Google signup failed");
      toast.error(err.response?.data?.message || "Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    onClose(); // Close current modal
    if (onSwitchToLogin) {
      onSwitchToLogin(); // Open login modal
    }
  };

  if (!onClose) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-2xl border border-green-500/20 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FaUser className="text-white text-2xl" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Join DevArena</h2>
            <p className="text-gray-400">Create your account and start coding</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaUser />
              </div>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
              />
            </motion.div>

            {/* Email Input */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaEnvelope />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </motion.div>

            {/* Password Validation Indicators */}
            {formData.password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="text-sm text-gray-400 mb-2">Password requirements:</div>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.length ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      passwordValidation.length ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    At least 6 characters
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.capital ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      passwordValidation.capital ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    At least 1 capital letter (A-Z)
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordValidation.number ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      passwordValidation.number ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    At least 1 number (0-9)
                  </div>
                </div>
              </motion.div>
            )}

            {/* Signup Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !passwordValidation.length || !passwordValidation.capital || !passwordValidation.number}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-900 to-black text-gray-400">or continue with</span>
            </div>
          </motion.div>

          {/* Google Signup */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google signup failed. Please try again.")}
              render={({ onClick, disabled }) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClick}
                  disabled={disabled || loading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-800 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <FaGoogle className="text-red-500 text-xl" />
                  Continue with Google
                </motion.button>
              )}
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center mt-6"
          >
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <motion.span 
                className="text-green-400 hover:text-green-300 cursor-pointer font-semibold"
                onClick={handleSwitchToLogin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign in
              </motion.span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SignupModal;
