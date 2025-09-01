import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Premium from "./pages/Premium";
import About from "./pages/About";
import ProblemDetails from "./pages/ProblemDetails";
import UserPage from "./pages/UserPage";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from './pages/Admin/AdminDashboard';

const App = () => {
  const { user, logout, login } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const navigate = useNavigate();

  const [role, setRole] = useState(""); // store role

  // Restore auth from backend cookie on page load
  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/check`, { withCredentials: true });
        if (data.loggedIn && data.username && data.token) {
          console.log('Auth check successful:', { username: data.username, hasToken: !!data.token });
          login(data.username, data.token);
          if (data.role) setRole(data.role);
        } else {
          console.log('Auth check failed - not logged in or missing data');
          setRole("");
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setRole("");
      }
    };
    check();
  }, []); // Remove login from dependencies to prevent infinite loop

  // Listen for logout events
  useEffect(() => {
    const handleUserLoggedOut = () => {
      console.log('=== APP.JSX: RECEIVED USERLOGGEDOUT EVENT ===');
      console.log('Current role before clearing:', role);
      console.log('Current user before clearing:', user);
      
      // Clear role state
      setRole("");
      console.log('Role cleared');
      
      // Navigate to home with replace to prevent back navigation
      navigate("/", { replace: true });
      console.log('Navigation to home triggered');
      
      console.log('=== APP.JSX: LOGOUT EVENT HANDLED ===');
    };

    window.addEventListener('userLoggedOut', handleUserLoggedOut);
    
    return () => {
      window.removeEventListener('userLoggedOut', handleUserLoggedOut);
    };
  }, [navigate, role, user]);


  // Handlers
  const handleLoginSuccess = (username, userRole, token) => {
    console.log('=== APP.JSX: LOGIN SUCCESS ===');
    console.log('Username:', username);
    console.log('User Role:', userRole);
    console.log('Token:', token ? 'exists' : 'null');
    
    if (!username || !userRole || !token) {
      console.error('❌ Missing required login data:', { username, userRole, token });
      return;
    }
    
    login(username, token);        // store username and token
    setRole(userRole);             // store role
    localStorage.setItem('userRole', userRole); // Store role in localStorage
    setIsLoginModalOpen(false);

    console.log('After login call - User:', username, 'Role:', userRole);

    if (userRole === "admin") {
      console.log('🚀 Redirecting admin to /admin');
      navigate("/admin");          // redirect Admin
    } else {
      console.log('🏠 Redirecting user to home');
      navigate("/");               // normal user
    }
  };

  const handleSignupSuccess = (username, userRole, token) => {
    login(username, token);        // store username and token
    setRole(userRole);
    setIsSignupModalOpen(false);
    navigate("/");                 // after signup, normal user goes to home
  };


  const handleLogout = async () => {
    console.log('=== APP.JSX: HANDLELOGOUT STARTED ===');
    console.log('Current user before logout:', user);
    console.log('Current role before logout:', role);
    
    try {
      console.log('Calling logout function...');
      await logout();                    // clear user context
      console.log('Logout function completed');
      
      setRole("");                       // App.jsx role state clear
      console.log('Role state cleared');
      
      console.log('Role cleared, navigating to home...');
      navigate("/", { replace: true });  // Use replace to prevent back navigation
      
      console.log('=== APP.JSX: HANDLELOGOUT COMPLETED ===');
    } catch (error) {
      console.error('Logout error in App.jsx:', error);
      // Force navigation even if there's an error
      setRole("");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white">
      {/* Hide Navbar only on /admin route, not globally by role */}
      {window.location.pathname !== "/admin" && (
        <Navbar
          isLoggedIn={!!user}
          username={user}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSignupClick={() => setIsSignupModalOpen(true)}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        <Route path="/" element={<Home onLoginClick={() => setIsLoginModalOpen(true)} isLoggedIn={!!user} />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/problems/:id" element={<ProblemDetails />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/about" element={<About />} />
        <Route path="/user/:username" element={<UserPage />} />
        <Route path="/userpage" element={<UserPage />} />
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        <Route
          path="/admin"
          element={
            user && role === "admin" ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                  <p className="text-gray-400 mb-4">You need admin privileges to access this page</p>
                  <button
                    onClick={() => navigate("/")}
                    className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            )
          }
        />
      </Routes>

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess} // pass username + role
          onSwitchToSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
      )}

      {isSignupModalOpen && (
        <SignupModal
          onClose={() => setIsSignupModalOpen(false)}
          onSignupSuccess={handleSignupSuccess} // pass username + role
          onSwitchToLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default App;
