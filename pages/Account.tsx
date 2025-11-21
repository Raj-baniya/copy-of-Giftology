import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from '../components/ui/Icons';
import { motion } from 'framer-motion';

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center md:justify-start gap-2 px-4 py-3 rounded-lg transition-all flex-shrink-0 whitespace-nowrap text-sm md:text-base ${
      active ? 'bg-primary/20 text-black font-bold border border-primary/20' : 'text-textMuted hover:bg-gray-100 border border-transparent'
    } ${window.innerWidth < 768 ? 'w-auto' : 'w-full text-left'}`}
  >
    <Icon className="w-4 h-4 md:w-5 md:h-5" />
    {label}
  </button>
);

export const Account = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');

  if (!user) return <Navigate to="/login" />;

  const handleUpdateName = async () => {
    if(newName.trim()) {
        await updateProfile(newName);
        setIsEditing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/30 rounded-full flex items-center justify-center text-2xl md:text-3xl font-serif text-primary-dark flex-shrink-0">
            {user.displayName.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              {isEditing ? (
                  <div className="flex gap-2 items-center justify-center md:justify-start">
                      <input 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)}
                        className="border rounded px-2 py-1 text-sm bg-white text-gray-900 focus:outline-none focus:border-primary"
                        placeholder={user.displayName}
                      />
                      <button onClick={handleUpdateName} className="text-green-600"><Icons.CheckCircle className="w-5 h-5"/></button>
                      <button onClick={() => setIsEditing(false)} className="text-red-400"><Icons.X className="w-5 h-5"/></button>
                  </div>
              ) : (
                <>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold">{user.displayName}</h1>
                    <button onClick={() => { setNewName(user.displayName); setIsEditing(true); }} className="text-textMuted hover:text-primary">
                        <Icons.Edit2 className="w-4 h-4" />
                    </button>
                </>
              )}
            </div>
            <p className="text-textMuted mb-3 text-sm">{user.email}</p>
            <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-textMuted uppercase tracking-wide">
              <Icons.User className="w-3 h-3" />
              Member since {new Date(user.joinDate).getFullYear()}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-4 gap-6">
          {/* Scrollable Tabs for Mobile */}
          <div className="bg-white rounded-xl shadow-sm p-2 md:p-4 flex md:flex-col overflow-x-auto gap-2 md:gap-1 scrollbar-hide sticky top-20 z-20 md:static md:h-fit">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={Icons.Package} label="Overview" />
            <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={Icons.ShoppingBag} label="Orders" />
            <TabButton active={activeTab === 'recipients'} onClick={() => setActiveTab('recipients')} icon={Icons.User} label="Recipients" />
            <TabButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={Icons.Calendar} label="Calendar" />
            <TabButton active={activeTab === 'spending'} onClick={() => setActiveTab('spending')} icon={Icons.Wallet} label="Spending" />
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Icons.Settings} label="Settings" />
          </div>

          {/* Content Area */}
          <div className="md:col-span-3 space-y-6">
            {activeTab === 'overview' ? (
                <>
                  {/* Recent Orders Placeholder */}
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                      <h3 className="font-serif text-lg md:text-xl font-bold mb-4">Recent Orders</h3>
                      <div className="space-y-4">
                          {[1, 2].map((i) => (
                              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-md shrink-0"></div>
                                    <div className="flex-1 sm:hidden">
                                        <h4 className="font-bold text-sm">Order #GF-293{i}</h4>
                                        <span className="font-bold text-sm">₹2,499</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 hidden sm:block">
                                      <h4 className="font-bold">Order #GF-293{i}</h4>
                                      <p className="text-sm text-textMuted">Delivered on Oct {10+i}, 2023</p>
                                  </div>
                                  <div className="flex justify-between items-center w-full sm:w-auto gap-3">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] md:text-xs font-bold rounded-full">Delivered</span>
                                    <span className="font-bold text-sm hidden sm:block">₹2,499</span>
                                    <button className="text-xs text-primary font-bold sm:hidden">View Details</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                </>
            ) : (
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm text-center min-h-[300px] flex flex-col items-center justify-center">
                    <Icons.Gift className="w-12 h-12 md:w-16 md:h-16 text-gray-200 mb-4" />
                    <h3 className="text-lg md:text-xl font-bold text-textMain mb-2">Coming Soon!</h3>
                    <p className="text-sm text-textMuted">We are working hard to bring you the {activeTab.replace('-', ' ')} feature.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};