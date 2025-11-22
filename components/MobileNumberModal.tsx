import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Icons } from './ui/Icons';
import { sendMobileNumberToAdmin } from '../services/emailService';
import { submitContactMessage } from '../services/supabaseService';

const STORAGE_KEY = 'giftology_mobile_submitted';

export const MobileNumberModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
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
    const isDismissed = sessionStorage.getItem('giftology_mobile_dismissed');

    // Only show if not submitted and not dismissed this session
    if (!hasSubmitted && !isDismissed) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form fields
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (mobileNumber.length !== 10 || !/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Email is optional, but if provided, validate it
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Send user details to admin via email service
      const emailResult = await sendMobileNumberToAdmin({
        name: name.trim(),
        mobileNumber: mobileNumber,
        email: email.trim() || 'Not provided'
      });

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error);
        // We continue even if email fails, to try saving to DB
      }

      // 2. Save to Supabase Database
      const dbResult = await submitContactMessage({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: mobileNumber,
        message: 'Mobile Number Collection Modal',
        source: 'mobile_modal'
      });

      if (!dbResult.success) {
        console.error('Database save failed:', dbResult.error);
      }

      // If either succeeded, we count it as a success for the user
      if (emailResult.success || dbResult.success) {
        // Mark as submitted in localStorage
        localStorage.setItem(STORAGE_KEY, 'true');
        localStorage.setItem('giftology_user_name', name.trim());
        localStorage.setItem('giftology_mobile_number', mobileNumber);
        localStorage.setItem('giftology_user_email', email.trim() || '');
        localStorage.setItem('giftology_mobile_submitted_at', new Date().toISOString());

        setSubmitSuccess(true);
        setError('');

        // Close modal after showing success message
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
      } else {
        // Both failed
        throw new Error('Failed to submit. Please check your connection and try again.');
      }

    } catch (error: any) {
      console.error('Unexpected error submitting mobile number:', error);
      setError(error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Don't close if submitting
    if (isSubmitting) return;
    setIsOpen(false);
    // Mark as dismissed for this session only (will show again on next visit)
    sessionStorage.setItem('giftology_mobile_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
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
                    Thank You!
                  </h2>
                  <p className="text-textMuted">
                    We'll be in touch soon.
                  </p>
                </div>
              ) : (
                <>
                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    <Icons.X className="w-5 h-5 text-gray-500" />
                  </button>

                  {/* Content */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.Phone className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-textMain mb-2">
                      Welcome to Giftology!
                    </h2>
                    <p className="text-textMuted text-sm">
                      Please share your details so we can connect with you.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                        <p className="font-bold mb-1">⚠️ Error</p>
                        <p>{error}</p>
                        <p className="text-xs mt-2 text-red-500">
                          Check the browser console for details
                        </p>
                      </div>
                    )}

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
                        autoFocus
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

                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim() || mobileNumber.length !== 10}
                      className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit
                          <Icons.CheckCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>

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
