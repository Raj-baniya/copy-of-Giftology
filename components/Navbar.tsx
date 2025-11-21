import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from './ui/Icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { cartCount, setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/30 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 gap-2 md:gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="bg-primary/20 p-1.5 md:p-2 rounded-full group-hover:bg-primary/30 transition-colors">
              <Icons.Gift className="w-5 h-5 md:w-6 md:h-6 text-primary-dark" />
            </div>
            <span className="font-serif text-xl md:text-2xl font-bold text-textMain tracking-wide">
              Giftology
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8 flex-shrink-0">
            <Link to="/shop" className="flex items-center gap-1.5 text-textMain hover:text-primary font-medium transition-colors">
                <Icons.Gift className="w-4 h-4" />
                Gift Guides
            </Link>
            <Link to="/shop?category=trending" className="flex items-center gap-1.5 text-textMain hover:text-primary font-medium transition-colors">
                <Icons.TrendingUp className="w-4 h-4" />
                Trending Now
            </Link>
            <Link to="/shop?category=occasions" className="flex items-center gap-1.5 text-textMain hover:text-primary font-medium transition-colors">
                <Icons.Calendar className="w-4 h-4" />
                Occasion Central
            </Link>
            
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 text-red-500 font-bold hover:text-red-600">
                  <Icons.Shield className="w-4 h-4" />
                  Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
            
            {/* Search Toggle */}
            <div className="relative">
                {isSearchOpen ? (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white rounded-full shadow-lg border border-gray-100 overflow-hidden w-[200px] md:w-[300px]">
                         <form onSubmit={handleSearch} className="w-full flex">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-2 pl-4 pr-2 text-sm focus:outline-none"
                                onBlur={() => !searchQuery && setIsSearchOpen(false)}
                            />
                            <button type="submit" className="p-2 text-primary"><Icons.Search className="w-4 h-4" /></button>
                         </form>
                    </div>
                ) : (
                    <button onClick={() => setIsSearchOpen(true)} className="p-2 hover:bg-gray-100 rounded-full">
                        <Icons.Search className="w-5 h-5 md:w-6 md:h-6 text-textMain" />
                    </button>
                )}
            </div>

            <button 
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icons.ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-textMain" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full animate-pulse shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-4 ml-1">
                <Link to="/account" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-bold border border-gray-200">
                      {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block ml-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 ml-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <Icons.X className="w-6 h-6" /> : <Icons.Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-background border-t border-gray-100 animate-in slide-in-from-top-5 absolute w-full z-40 shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <Link to="/shop" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm" onClick={() => setIsMenuOpen(false)}>
                    <Icons.Gift className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-bold">Gift Guides</span>
                </Link>
                <Link to="/shop?category=trending" className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm" onClick={() => setIsMenuOpen(false)}>
                    <Icons.TrendingUp className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm font-bold">Trending</span>
                </Link>
            </div>
            
            <Link to="/" className="block py-3 text-base font-medium border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/shop" className="block py-3 text-base font-medium border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>Explore All Gifts</Link>
            
            {user ? (
              <>
                <Link to="/account" className="block py-3 text-base font-medium border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block py-3 text-red-500 font-bold border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left py-3 text-base text-textMuted">Sign Out</button>
              </>
            ) : (
              <Link to="/login" className="block w-full text-center py-3 mt-2 bg-black text-white rounded-lg font-bold" onClick={() => setIsMenuOpen(false)}>Sign In / Sign Up</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};