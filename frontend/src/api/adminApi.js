import axios from 'axios';

const API_URL = "https://devarena-leetcode-2.onrender.com/api/admin";

// Create an axios instance
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // keep your cookies if needed
});

// Add token automatically to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // token saved at login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Problems
export const getProblems = () => API.get('/problems');
export const addProblem = (data) => API.post('/problems', data);
export const updateProblem = (id, data) => API.put(`/problems/${id}`, data);
export const deleteProblem = (id) => API.delete(`/problems/${id}`);

// Premium
export const getPremium = () => API.get('/premium');
export const addPremium = (formData) => API.post('/premium', formData);
export const updatePremium = (id, formData) => API.put(`/premium/${id}`, formData);
export const deletePremium = (id) => API.delete(`/premium/${id}`);

// Users
export const getUsers = () => API.get('/users');
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
