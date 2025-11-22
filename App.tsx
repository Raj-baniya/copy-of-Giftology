import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Login } from './pages/Login';
import { Account } from './pages/Account';
import { Admin } from './pages/Admin';
import { Checkout } from './pages/Checkout';
import { Search } from './pages/Search';
import { AdminLogin } from './pages/AdminLogin';
import { CartDrawer } from './components/CartDrawer';
import { MobileNumberModal } from './components/MobileNumberModal';

import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => {
  if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('YOUR_PUBLISHABLE_KEY_HERE')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center border border-red-200">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-700 mb-4">
            The Clerk Publishable Key is missing or invalid.
          </p>
          <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded mb-4 font-mono">
            Please update the <span className="font-bold">.env</span> file with your actual Clerk key.
          </p>
          <p className="text-xs text-gray-400">
            Current value: {PUBLISHABLE_KEY || 'undefined'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen bg-background font-sans text-textMain">
              <Navbar />
              <CartDrawer />
              <MobileNumberModal />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <footer className="bg-white py-8 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 text-center text-textMuted text-sm flex flex-col items-center gap-4">
                  <img src="/logo.png" alt="Giftology" className="h-8 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
                  <p>&copy; 2023 Giftology. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  );
};

export default App;