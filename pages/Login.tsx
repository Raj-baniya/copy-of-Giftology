import React, { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Hide mobile number modal when on login page
  useEffect(() => {
    // Prevent mobile modal from showing on login page
    sessionStorage.setItem('giftology_mobile_dismissed', 'true');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative z-50">
      <div className="w-full max-w-md relative z-50">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'
                }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="flex justify-center relative z-50">
          {isLogin ? (
            <SignIn
              fallbackRedirectUrl="/"
              signUpUrl="#"
              afterSignInUrl="/"
            />
          ) : (
            <SignUp
              fallbackRedirectUrl="/"
              signInUrl="#"
              afterSignUpUrl="/"
            />
          )}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/admin-login')} className="text-xs text-gray-400 hover:text-primary transition-colors">
            Admin Access
          </button>
        </div>
      </div>
    </div>
  );
};