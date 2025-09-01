import React from "react";
import { FaTwitter, FaGithub, FaLinkedin, FaCode, FaTrophy, FaUsers, FaGem } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-black text-gray-400 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-10">
        
        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">DevArena</h2>
          <p className="text-gray-400 mb-4">
            The ultimate competitive programming platform. Solve challenging problems, 
            climb the leaderboard, and sharpen your coding skills with real-time feedback.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-green-500 text-xl transition-colors">
              <FaTwitter />
            </a>
            <a href="#" className="text-gray-400 hover:text-green-500 text-xl transition-colors">
              <FaGithub />
            </a>
            <a href="#" className="text-gray-400 hover:text-green-500 text-xl transition-colors">
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link to="/" className="hover:text-green-500 transition-colors">Home</Link>
            </li>
            <li>
              <Link to="/problems" className="hover:text-green-500 transition-colors">Problems</Link>
            </li>
            <li>
              <Link to="/premium" className="hover:text-green-500 transition-colors">Premium</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-green-500 transition-colors">About</Link>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <FaCode className="text-green-500" />
              <span>Practice Problems</span>
            </li>
            <li className="flex items-center gap-2">
              <FaTrophy className="text-green-500" />
              <span>Competitive Programming</span>
            </li>
            <li className="flex items-center gap-2">
              <FaUsers className="text-green-500" />
              <span>Community</span>
            </li>
            <li className="flex items-center gap-2">
              <FaGem className="text-green-500" />
              <span>Premium Content</span>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Contact & Support</h3>
          <div className="space-y-3">
            <p className="text-sm">
              <span className="text-green-500">Email:</span> support@devarena.com
            </p>
            <p className="text-sm">
              <span className="text-green-500">Discord:</span> Join our community
            </p>
            <p className="text-sm">
              <span className="text-green-500">Status:</span> All systems operational
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 pt-6 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DevArena. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-green-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-green-500 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-green-500 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
