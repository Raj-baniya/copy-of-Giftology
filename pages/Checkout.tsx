import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../components/ui/Icons';
import { store } from '../services/store';

const steps = ['Shipping', 'Payment', 'Confirmation'];

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');

  // Redirect if empty cart
  useEffect(() => {
    if (cart.length === 0 && currentStep !== 2) {
      navigate('/shop');
    }
  }, [cart, navigate, currentStep]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create order
    if (user) {
      await store.createOrder(user.id, cart, cartTotal);
    }

    setProcessing(false);
    setCurrentStep(2);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Stepper */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-2 ${index <= currentStep ? 'text-primary' : 'text-gray-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${index <= currentStep ? 'border-primary bg-primary/10' : 'border-gray-300'
                    }`}>
                    {index + 1}
                  </div>
                  <span className="hidden sm:block font-medium">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${index < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode='wait'>
              {currentStep === 0 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="font-serif text-2xl font-bold mb-6">Shipping Details</h2>
                  <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setCurrentStep(1); }}>
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="text" placeholder="First Name" className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                      <input required type="text" placeholder="Last Name" className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                    </div>
                    <input required type="email" placeholder="Email Address" defaultValue={user?.email} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                    <input required type="text" placeholder="Address" className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="text" placeholder="City" className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                      <input required type="text" placeholder="Zip Code" className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors mt-4">Continue to Payment</button>
                  </form>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="font-serif text-2xl font-bold mb-6">Payment Method</h2>
                  <form onSubmit={handlePayment}>

                    {/* Credit Card Option */}
                    <div className={`mb-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                        <input
                          type="radio"
                          name="payment"
                          className="w-5 h-5 text-primary accent-primary"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <span className="font-medium flex items-center gap-2"><Icons.CreditCard className="w-5 h-5" /> Credit / Debit Card</span>
                      </label>

                      {/* Card Inputs - Only Visible if Selected */}
                      {paymentMethod === 'card' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-4 space-y-3 pl-8"
                        >
                          <input required={paymentMethod === 'card'} type="text" placeholder="Card Number" className="border rounded-lg p-3 w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary outline-none" />
                          <div className="grid grid-cols-2 gap-4">
                            <input required={paymentMethod === 'card'} type="text" placeholder="MM/YY" className="border rounded-lg p-3 w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary outline-none" />
                            <input required={paymentMethod === 'card'} type="text" placeholder="CVC" className="border rounded-lg p-3 w-full bg-white text-gray-900 focus:ring-2 focus:ring-primary outline-none" />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* UPI Option */}
                    <div className={`mb-4 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                        <input
                          type="radio"
                          name="payment"
                          className="w-5 h-5 text-primary accent-primary"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                        />
                        <span className="font-medium flex items-center gap-2"><Icons.Smartphone className="w-5 h-5" /> UPI / QR Code</span>
                      </label>

                      {paymentMethod === 'upi' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-4 pl-8 flex flex-col items-center"
                        >
                          <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm flex flex-col items-center">
                            <p className="text-sm font-bold text-gray-700 mb-3">Scan to Pay</p>

                            {/* 
                                      REPLACE the src below with your actual QR code image URL. 
                                      For now, this is a standard placeholder QR code.
                                    */}
                            <img
                              src="/upi-qr.png"
                              alt="UPI QR Code"
                              className="w-48 h-48 mb-2 border-4 border-gray-800 rounded-lg"
                            />

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Listening for payment...
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* COD Option */}
                    <div className={`mb-6 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <label className="flex items-center gap-3 cursor-pointer w-full">
                        <input
                          type="radio"
                          name="payment"
                          className="w-5 h-5 text-primary accent-primary"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                        />
                        <span className="font-medium flex items-center gap-2"><Icons.Banknote className="w-5 h-5" /> Cash on Delivery</span>
                      </label>
                      {paymentMethod === 'cod' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-2 pl-8"
                        >
                          <p className="text-sm text-gray-600">Pay securely with cash upon delivery.</p>
                        </motion.div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      {processing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> :
                        (paymentMethod === 'cod' ? `Place Order - ₹${cartTotal.toLocaleString()}` : `I have Paid ₹${cartTotal.toLocaleString()}`)
                      }
                    </button>
                    <button type="button" onClick={() => setCurrentStep(0)} className="w-full mt-2 text-textMuted hover:underline">Back to Shipping</button>
                  </form>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 rounded-xl shadow-sm text-center flex flex-col items-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                  >
                    <Icons.CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>
                  <h2 className="font-serif text-3xl font-bold mb-2">Order Confirmed!</h2>
                  <p className="text-textMuted mb-8">Thank you for your purchase.</p>
                  <button onClick={() => navigate('/account')} className="bg-primary text-black px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition-colors">
                    View Order in Account
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          {currentStep < 2 && (
            <div className="bg-gray-50 p-6 rounded-xl h-fit">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-4 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-textMuted">{item.name} x{item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-xl">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};