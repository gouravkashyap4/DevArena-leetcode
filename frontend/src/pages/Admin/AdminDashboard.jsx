import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCode, FaCrown, FaUsers, FaSignOutAlt, FaChartLine, FaCog } from 'react-icons/fa';
import ProblemsManagement from './ProblemsManagement';
import PremiumManagement from './PremiumManagement';
import UsersManagement from './UsersManagement';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { 
    name: 'Problems', 
    component: ProblemsManagement, 
    icon: FaCode,
    description: 'Manage coding problems and challenges'
  },
  { 
    name: 'Premium', 
    component: PremiumManagement, 
    icon: FaCrown,
    description: 'Manage premium content and subscriptions'
  },
  { 
    name: 'Users', 
    component: UsersManagement, 
    icon: FaUsers,
    description: 'Manage user accounts and permissions'
  },
];

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('Problems');
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Check authentication and admin access
  useEffect(() => {
    console.log('AdminDashboard: Checking authentication...');
    console.log('User:', user);
    console.log('Token:', token ? 'exists' : 'null');
    console.log('isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated || !token) {
      console.log('AdminDashboard: No authentication, redirecting to home');
      navigate('/');
      return;
    }
    
    // Check if user is admin - get role from localStorage or context
    const userRole = localStorage.getItem('userRole') || 'user';
    console.log('User Role from localStorage:', userRole);
    
    if (userRole !== 'admin') {
      console.log('AdminDashboard: User is not admin, redirecting to home');
      navigate('/');
      return;
    }
    
    console.log('AdminDashboard: Authentication and admin role valid');
  }, [isAuthenticated, token, user, navigate]);
  
  const ActiveComponent = tabs.find(t => t.name === activeTab).component;

  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Modern Sidebar */}
      <motion.div 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-gradient-to-b from-gray-900 to-black shadow-2xl border-r border-gray-800 flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <FaCog className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              <p className="text-gray-400 text-sm">DevArena Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 p-4 space-y-2">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <motion.button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`w-full p-4 rounded-xl transition-all duration-300 text-left group ${
                  activeTab === tab.name 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`text-xl ${activeTab === tab.name ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                  <div>
                    <div className="font-semibold">{tab.name}</div>
                    <div className={`text-xs ${activeTab === tab.name ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-300'}`}>
                      {tab.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <motion.button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaSignOutAlt />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-gray-900/50 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{activeTab} Management</h1>
              <p className="text-gray-400 mt-1">
                {tabs.find(t => t.name === activeTab)?.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                <span className="text-green-400 text-sm font-medium">Admin</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
