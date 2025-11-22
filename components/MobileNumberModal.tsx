import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Icons } from './ui/Icons';
import { sendMobileNumberToAdmin } from '../services/emailService';
import { submitContactMessage } from '../services/supabaseService';
import { auth } from '../services/firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const STORAGE_KEY = 'giftology_mobile_submitted';

export const MobileNumberModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Don't show modal on login, admin-login, checkout, or account pages
    const hideOnPages = ['/login', '/admin-login', '/checkout', '/account'];
    if (hideOnPages.some(path => location.pathname.startsWith(path))) {
      setIsOpen(false);
      return;
    }

    // Check if mobile number has already been submitted
    const hasSubmitted = localStorage.getItem(STORAGE_KEY);

    // Only show if not submitted (Removed session dismissal check to make it mandatory)
    if (!hasSubmitted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const setupRecaptcha = () => {
    if (!auth) {
      console.error('Firebase Auth not initialized');
      setError('Authentication service unavailable.');
      return;
    }
    const container = document.getElementById('recaptcha-container');
    if (!container) {
      console.error('Recaptcha container not found');
      return;
    }

    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log('Recaptcha solved');
          },
          'expired-callback': () => {
            console.log('Recaptcha expired');
          }
        });
      } catch (err) {
        console.error('Error initializing Recaptcha:', err);
      }
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setupRecaptcha();
    const appVerifier = (window as any).recaptchaVerifier;
    const phoneNumber = `+91${mobileNumber}`;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      setIsSubmitting(false);
      alert('OTP sent to your mobile number!');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      setIsSubmitting(false);
      // Reset recaptcha
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!confirmationResult) {
      setError('Something went wrong. Please request OTP again.');
      setIsSubmitting(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      // OTP Verified! Now submit data.
      await submitData();
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError('Invalid OTP. Please try again.');
      setIsSubmitting(false);
    }
  };

  const submitData = async () => {
    try {
      // 1. Send user details to admin via email service (Keep existing logic)
      const emailResult = await sendMobileNumberToAdmin({
        name: name.trim(),
        mobileNumber: mobileNumber,
        email: email.trim() || 'Not provided'
      });

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
      }

      // 2. Save to Supabase Database
      const dbResult = await submitContactMessage({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: mobileNumber,
        message: 'Mobile Number Collection Modal (Verified)',
        source: 'mobile_modal_verified'
      });

      if (!dbResult.success) {
        console.error('Database save failed:', dbResult.error);
      }

      // Mark as submitted
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem('giftology_user_name', name.trim());
      localStorage.setItem('giftology_mobile_number', mobileNumber);
      localStorage.setItem('giftology_user_email', email.trim() || '');
      localStorage.setItem('giftology_mobile_submitted_at', new Date().toISOString());

      setSubmitSuccess(true);
      setError('');

      setTimeout(() => {
        setIsOpen(false);
      }, 2000);

    } catch (error: any) {
      console.error('Unexpected error submitting data:', error);
      setError('Data submission failed, but you are verified.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - No onClick to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative z-[101]"
            >
              {submitSuccess ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Icons.CheckCircle className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h2 className="font-serif text-2xl font-bold text-textMain mb-2">
                    Verified & Connected!
                  </h2>
                  <p className="text-textMuted">
                    Thank you for joining Giftology.
                  </p>
                </div>
              ) : (
                <>
                  {/* Content */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.Phone className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-textMain mb-2">
                      {showOtpInput ? 'Verify OTP' : 'Welcome to Giftology!'}
                    </h2>
                    <p className="text-textMuted text-sm">
                      {showOtpInput
                        ? `Enter the OTP sent to +91 ${mobileNumber}`
                        : 'Please verify your number to continue shopping.'}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                        <p>{error}</p>
                      </div>
                    )}

                    {!showOtpInput ? (
                      <>
                        {/* Name Field */}
                        <div>
                          <input
                            type="text"
                            placeholder="Your Name *"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              setError('');
                            }}
                            disabled={isSubmitting}
                            required
                            className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none bg-white text-gray-900 text-lg disabled:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          />
                        </div>

                        {/* Mobile Number Field */}
                        <div className="flex border-2 border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                          <span className="bg-gray-50 px-4 py-3 text-gray-600 border-r flex items-center font-bold">
                            +91
                          </span>
                          <input
                            type="tel"
                            placeholder="Mobile Number *"
                            value={mobileNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setMobileNumber(value);
                              setError('');
                            }}
                            disabled={isSubmitting}
                            required
                            className="flex-1 p-3 outline-none bg-white text-gray-900 text-lg disabled:bg-gray-50"
                          />
                        </div>

                        {/* Email Field (Optional) */}
                        <div>
                          <input
                            type="email"
                            placeholder="Email Address (Optional)"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError('');
                            }}
                            disabled={isSubmitting}
                            className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none bg-white text-gray-900 text-lg disabled:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          />
                        </div>
                      </>
                    ) : (
                      /* OTP Input */
                      <div>
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => {
                            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                            setError('');
                          }}
                          disabled={isSubmitting}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none bg-white text-gray-900 text-lg text-center tracking-widest disabled:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          autoFocus
                        />
                      </div>
                    )}

                    <div id="recaptcha-container"></div>

                    <button
                      type="submit"
                      disabled={isSubmitting || (!showOtpInput && (!name.trim() || mobileNumber.length !== 10)) || (showOtpInput && otp.length !== 6)}
                      className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          {showOtpInput ? 'Verifying...' : 'Sending OTP...'}
                        </>
                      ) : (
                        <>
                          {showOtpInput ? 'Verify OTP' : 'Send OTP'}
                          <Icons.ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {showOtpInput && (
                      <button
                        type="button"
                        onClick={() => setShowOtpInput(false)}
                        className="w-full text-sm text-gray-500 hover:text-black underline"
                      >
                        Change Number
                      </button>
                    )}

                    <p className="text-xs text-center text-textMuted">
                      We respect your privacy. Your number will only be used to contact you.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
