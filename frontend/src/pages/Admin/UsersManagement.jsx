import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "https://devarena-leetcode-2.onrender.com/api/admin/users";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL, { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <h2 className="text-3xl font-bold mb-6 text-green-400 text-center">Users Management</h2>

      <div className="overflow-x-auto">
        <motion.table className="min-w-full bg-gray-800 shadow-lg rounded-lg overflow-hidden" layout>
          <thead className="bg-gradient-to-r from-green-600 to-green-400 text-white">
            <tr>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
            {users.map(u => (
              <motion.tr 
                key={u._id} 
                layout 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-200"
              >
                <td className="p-3">{u.username}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <button 
                    onClick={() => handleDelete(u._id)} 
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded-md shadow"
                  >
                    Delete
                  </button>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </motion.table>
      </div>
    </div>
  );
};

export default UsersManagement;
