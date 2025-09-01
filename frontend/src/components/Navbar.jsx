import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaHome, FaCompass, FaInfoCircle, FaCode, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ isLoggedIn, username, onLoginClick, onSignupClick, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Common links for everyone
  const commonLinks = [
    { name: "Home", to: "/", icon: FaHome },
    { name: "Premium", to: "/premium", icon: FaCrown },
    { name: "About", to: "/about", icon: FaInfoCircle },
  ];

  // Private links for logged-in users
  const privateLinks = [{ name: "Problems", to: "/problems", icon: FaCode }];

  const navLinks = isLoggedIn ? [...commonLinks, ...privateLinks] : commonLinks;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header 
      className="w-full bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-2xl border-b border-gray-700/30 backdrop-blur-sm relative z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", damping: 20 }}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Logo */}
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <span className="text-xl sm:text-2xl font-bold tracking-wide bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            DevArena
          </span>
        </motion.div>

        {/* Desktop Navigation Links */}
        <ul className="hidden lg:flex items-center gap-8 xl:gap-10 text-gray-300 font-medium">
          {navLinks.map((link, index) => (
            <motion.li 
              key={link.name} 
              className="relative group"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  link.name === "Premium"
                    ? "text-yellow-400 font-bold hover:text-white hover:bg-yellow-500/10"
                    : "hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <link.icon className="text-lg" />
                {link.name}
              </Link>
              {/* Animated underline effect */}
              <motion.span 
                className="absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </motion.li>
          ))}
        </ul>

        {/* Desktop Login / Profile Buttons */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {isLoggedIn === null ? (
            <motion.span 
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Checking...
            </motion.span>
          ) : !isLoggedIn ? (
            <>
              <motion.button 
                onClick={onLoginClick} 
                className="text-gray-200 border border-gray-600 px-6 py-2.5 rounded-xl hover:border-emerald-500 hover:text-emerald-400 transition-all duration-300 text-sm lg:text-base font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button 
                onClick={onSignupClick} 
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 px-6 py-2.5 rounded-xl transition-all duration-300 text-sm lg:text-base font-semibold shadow-lg hover:shadow-emerald-500/25"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <Link
                  to="/userpage"
                  className="p-3 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-emerald-500/20 hover:to-blue-500/20 flex items-center justify-center transition-all duration-300 border border-gray-600/30 hover:border-emerald-500/50 group"
                  title="Profile"
                >
                  <FaUser className="text-gray-300 group-hover:text-emerald-400 transition-colors duration-300" size={18} />
                </Link>

                <motion.button
                  onClick={() => {
                    console.log('Desktop logout button clicked');
                    try {
                      onLogout();
                    } catch (error) {
                      console.error('Desktop logout error:', error);
                    }
                  }}
                  className="p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 flex items-center justify-center transition-all duration-300 border border-red-500/30 hover:border-red-400/50 group"
                  title="Logout"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSignOutAlt className="text-red-400 group-hover:text-red-300 transition-colors duration-300" size={18} />
                </motion.button>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          onClick={toggleMobileMenu}
          className="lg:hidden p-3 text-gray-300 hover:text-white transition-colors duration-200 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl"
          aria-label="Toggle mobile menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaTimes size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FaBars size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="lg:hidden absolute top-full left-0 w-full bg-gradient-to-b from-gray-900/95 to-black/95 border-b border-gray-700/30 backdrop-blur-md z-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div 
              className="px-4 py-6 space-y-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {/* Mobile Navigation Links */}
              <ul className="space-y-3">
                {navLinks.map((link, index) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      to={link.to}
                      onClick={closeMobileMenu}
                                             className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
                         link.name === "Premium"
                           ? "text-yellow-400 font-semibold hover:bg-yellow-500/10"
                           : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                       }`}
                    >
                      <link.icon className="text-lg" />
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Mobile Login / Profile Buttons */}
              <motion.div 
                className="pt-4 border-t border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {isLoggedIn === null ? (
                  <span className="block text-gray-400 text-center py-2">Checking...</span>
                ) : !isLoggedIn ? (
                  <div className="space-y-3">
                    <motion.button 
                      onClick={() => { onLoginClick(); closeMobileMenu(); }} 
                      className="w-full text-gray-200 border border-gray-600 px-4 py-3 rounded-xl hover:border-emerald-500 hover:text-emerald-400 transition-all duration-300 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Login
                    </motion.button>
                    <motion.button 
                      onClick={() => { onSignupClick(); closeMobileMenu(); }} 
                      className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 px-4 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign Up
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/userpage"
                        onClick={closeMobileMenu}
                        className="p-3 rounded-xl bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-emerald-500/20 hover:to-blue-500/20 flex items-center justify-center transition-all duration-300 border border-gray-600/30 hover:border-emerald-500/50"
                        title="Profile"
                      >
                        <FaUser className="text-gray-300" size={20} />
                      </Link>
                    </motion.div>

                    <motion.button
                      onClick={() => { 
                        console.log('Mobile logout button clicked');
                        try {
                          onLogout(); 
                          closeMobileMenu(); 
                        } catch (error) {
                          console.error('Mobile logout error:', error);
                        }
                      }}
                      className="p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 flex items-center justify-center transition-all duration-300 border border-red-500/30 hover:border-red-400/50"
                      title="Logout"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSignOutAlt className="text-red-400" size={20} />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;




