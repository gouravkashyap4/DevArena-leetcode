import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // ✅ Initialize from localStorage (avoid flicker on first render)
  const [user, setUser] = useState(localStorage.getItem("user") || null);
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const currentUser = localStorage.getItem("user");
    if (!currentUser) return [];
    const stored = localStorage.getItem(`solved_${currentUser}`);
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ Add token state management
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // ✅ Set up axios defaults with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem("token");
    }
  }, [token]);

  // ✅ Hydrate solved problems from backend on mount/login
  useEffect(() => {
    const fetchSolved = async () => {
      try {
        if (!user || !token) return;
        console.log('Fetching solved problems for user:', user);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user-progress/progress/username/${user}`, {
          withCredentials: true,
        });
        console.log('API response:', res.data);
        const solved = (res.data?.solvedProblems || []).map((p) => ({
          id: p._id,
          title: p.title,
          difficulty: p.difficulty,
        }));
        console.log('Processed solved problems:', solved);
        setSolvedProblems(solved);
        localStorage.setItem(`solved_${user}`, JSON.stringify(solved));
      } catch (e) {
        console.error('Error fetching solved problems:', e);
        // fallback to local storage already set
      }
    };
    fetchSolved();
  }, [user, token]);

  // ✅ Fetch user profile data including photo
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user || !token || profileLoading) return;
      
      try {
        setProfileLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
          withCredentials: true,
        });
        setUserProfile(res.data);
      } catch (e) {
        console.error('Error fetching user profile:', e);
        // If profile fetch fails, try to refresh token or logout
        if (e.response?.status === 401) {
          console.log('Token expired, logging out...');
          logout();
        }
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, token]);

  // ✅ Login with token management
  const login = React.useCallback((username, userToken) => {
    console.log('=== AUTHCONTEXT: LOGIN CALLED ===');
    console.log('Username:', username);
    console.log('Token:', userToken ? 'exists' : 'null');
    
    setUser(username);
    setToken(userToken);
    
    console.log('State set - User:', username, 'Token:', userToken ? 'exists' : 'null');
    
    // Set localStorage
    localStorage.setItem("user", username);
    if (userToken) {
      localStorage.setItem("token", userToken);
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      console.log('Axios header set');
    } else {
      console.log('WARNING: No token provided for login');
    }
    
    // Load solved problems
    const stored = JSON.parse(localStorage.getItem(`solved_${username}`)) || [];
    setSolvedProblems(stored);
    
    console.log('=== AUTHCONTEXT: LOGIN COMPLETED ===');
  }, []);

  // ✅ Logout with proper cleanup
  const logout = React.useCallback(async () => {
    try {
      console.log('=== AUTHCONTEXT: LOGOUT STARTED ===');
      console.log('Logging out user:', user);
      console.log('Current token exists:', !!token);
      
      // Always try to call backend logout, even without token (to clear cookies)
      try {
        console.log('Calling backend logout...');
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/logOutUser`, {}, {
          withCredentials: true,
          timeout: 5000 // 5 second timeout
        });
        console.log('Backend logout successful:', response.data);
      } catch (backendError) {
        console.error('Backend logout error (continuing with frontend cleanup):', backendError);
        // Continue with frontend cleanup even if backend fails
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear frontend state regardless of backend response
      console.log('Clearing frontend state...');
      
      // Clear all state variables immediately
      setUser(null);
      setToken(null);
      setUserProfile(null);
      setSolvedProblems([]);
      
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      
      // Clear solved problems for all users
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('solved_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear axios default headers
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('Frontend state cleared successfully');
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      // Force a page refresh after a short delay to ensure all components update
      setTimeout(() => {
        console.log('Forcing page reload...');
        window.location.href = '/'; // Use href instead of reload for better navigation
      }, 200);
      
      console.log('=== AUTHCONTEXT: LOGOUT COMPLETED ===');
    }
  }, [user, token]);

  // ✅ Add solved problem locally and persist to backend
  const addSolvedProblem = React.useCallback(async (problem, language = null, solveTime = null) => {
    console.log('addSolvedProblem called with:', { problem, language, solveTime });
    
    setSolvedProblems((prev) => {
      if (!prev.some((p) => p.id === (problem._id || problem.id))) {
        const updated = [
          ...prev,
          {
            id: problem._id || problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
          },
        ];
        if (user) {
          localStorage.setItem(`solved_${user}`, JSON.stringify(updated));
        }
        return updated;
      }
      return prev;
    });

    try {
      if (user && token) {
        console.log('Sending request to backend with:', {
          username: user,
          problemId: problem._id || problem.id,
          language: language,
          solveTime: solveTime
        });
        
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user-progress/progress/solved`,
          {
            username: user,
            problemId: problem._id || problem.id,
            language: language,
            solveTime: solveTime
          },
          { withCredentials: true }
        );
        
        console.log('Backend response:', response.data);
        
        // Update user profile with new statistics
        if (response.data.userStats) {
          console.log('Updating user profile with:', response.data.userStats);
          setUserProfile(prev => ({
            ...prev,
            ...response.data.userStats
          }));
        }
        
        console.log('Problem solved successfully:', response.data);
      } else {
        console.log('User or token not available:', { user, hasToken: !!token });
      }
    } catch (e) {
      console.error('Error adding solved problem:', e);
      // ignore network errors for now; local state remains
    }
  }, [user, token]);

  // ✅ Get user statistics
  const getUserStats = React.useCallback(async () => {
    try {
      if (!user || !token) return null;
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-progress/stats/${user}`,
        { withCredentials: true }
      );
      
      return response.data;
    } catch (e) {
      console.error('Error fetching user stats:', e);
      return null;
    }
  }, [user, token]);

  // ✅ Simple test logout function
  const testLogout = React.useCallback(() => {
    console.log('=== TEST LOGOUT CALLED ===');
    console.log('Current user:', user);
    console.log('Current token:', token);
    
    // Simple state clearing
    setUser(null);
    setToken(null);
    setUserProfile(null);
    setSolvedProblems([]);
    
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    
    // Clear axios default headers
    delete axios.defaults.headers.common['Authorization'];
    
    console.log('Test logout completed');
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Force page reload
    window.location.href = '/';
  }, []);

  // ✅ Manual logout function (simpler version)
  const manualLogout = React.useCallback(() => {
    console.log('=== MANUAL LOGOUT ===');
    
    // Clear all state
    setUser(null);
    setToken(null);
    setUserProfile(null);
    setSolvedProblems([]);
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Force redirect
    window.location.href = '/';
  }, []);

  // ✅ Force logout function (works even without token)
  const forceLogout = React.useCallback(() => {
    console.log('=== FORCE LOGOUT ===');
    
    // Clear everything immediately
    setUser(null);
    setToken(null);
    setUserProfile(null);
    setSolvedProblems([]);
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Force redirect immediately
    window.location.href = '/';
  }, []);

  // ✅ Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user, 
    token,
    solvedProblems, 
    login, 
    logout, 
    testLogout, // Add test logout function
    manualLogout, // Add manual logout function
    forceLogout, // Add force logout function
    addSolvedProblem, 
    userProfile,
    getUserStats,
    isAuthenticated: !!token,
    profileLoading
  }), [user, token, solvedProblems, userProfile, profileLoading, login, logout, testLogout, manualLogout, forceLogout, addSolvedProblem, getUserStats]);

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};
