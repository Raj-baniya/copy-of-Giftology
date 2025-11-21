import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
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

        <div className="flex justify-center">
          {isLogin ? (
            <SignIn fallbackRedirectUrl="/account" />
          ) : (
            <SignUp fallbackRedirectUrl="/account" />
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