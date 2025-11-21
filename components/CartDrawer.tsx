import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Icons } from './ui/Icons';

export const CartDrawer = () => {
  const { cart, isCartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-background">
              <h2 className="font-serif text-2xl font-bold text-textMain">Your Bag</h2>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-textMuted">
                  <Icons.ShoppingBag className="w-16 h-16 mb-4 text-accent" />
                  <p className="text-lg">Your cart is empty</p>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="mt-4 text-primary font-semibold hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="flex gap-4 bg-white p-2 rounded-lg border border-transparent hover:border-gray-100 transition-all"
                  >
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md bg-gray-50" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-textMain line-clamp-1">{item.name}</h3>
                        <p className="text-sm text-textMuted">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 border border-gray-200 rounded-full px-2 py-1">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:text-primary"
                          >
                            <Icons.Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:text-primary"
                          >
                            <Icons.Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 hover:text-red-500 p-1"
                        >
                          <Icons.Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-background">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-textMuted">Subtotal</span>
                  <span className="text-xl font-bold font-serif">₹{cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-800 transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};