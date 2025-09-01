import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";

const root = createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <AuthProvider>   {/* ✅ Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
