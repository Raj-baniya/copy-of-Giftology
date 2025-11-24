import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../components/ui/Icons';
import { store } from '../services/store';
import { LocationPicker } from '../components/LocationPicker';
import { sendOrderConfirmationToUser, sendOrderNotificationToAdmin, OrderEmailParams } from '../services/emailService';

const steps = ['Shipping', 'Payment', 'Confirmation'];

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [isFastDelivery, setIsFastDelivery] = useState(false);

  const finalTotal = cartTotal + (isFastDelivery ? 100 : 0);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryDate: '',
    deliveryTime: ''
  });

  // UPI Screenshot State
  const [screenshot, setScreenshot] = useState<string | null>(null);

  // Address Management
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveAddress, setSaveAddress] = useState(true);

  useEffect(() => {
    if (user) {
      store.getUserAddresses(user.id).then(setSavedAddresses);
    }
  }, [user]);

  const handleAddressSelect = (addr: any) => {
    setFormData({
      ...formData,
      firstName: addr.firstName || '',
      lastName: addr.lastName || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      zipCode: addr.zipCode || ''
    });
  };

  // Redirect if empty cart
  useEffect(() => {
    if (cart.length === 0 && currentStep !== 2) {
      navigate('/shop');
    }
  }, [cart, navigate, currentStep]);

  // Calculate minimum date (Today + 2 days)
  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handling Shipping Submit', formData);

    if (formData.phone.length !== 10) {
      console.log('Validation Failed: Phone length', formData.phone.length);
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (formData.zipCode.length !== 6) {
      console.log('Validation Failed: Zip length', formData.zipCode.length);
      alert('Zip Code must be 6 digits.');
      return;
    }
    // Removed Mumbai restriction
    // if (formData.city.toLowerCase() !== 'mumbai') {
    //   console.log('Validation Failed: City', formData.city);
    //   alert('We currently deliver only in Mumbai.');
    //   return;
    // }

    console.log('Validation Passed. Moving to step 1.');
    setCurrentStep(1);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'upi' && !screenshot) {
      alert('Please upload the payment screenshot.');
      return;
    }

    setProcessing(true);

    try {
      // Check if user is a real Supabase user or a mock OTP user
      const isRealUser = user && !user.id.startsWith('otp_');
      const dbUserId = isRealUser ? user.id : null;

      // 1. Create Order in Store (Supabase)
      const orderDetails = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        deliveryDate: formData.deliveryDate,
        deliveryTime: formData.deliveryTime,
        deliveryType: isFastDelivery ? 'Fast Delivery' : 'Standard Delivery',
        paymentMethod,
        screenshot: screenshot || undefined,
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          state: formData.state,
          country: 'India'
        },
        guestInfo: !isRealUser ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        } : undefined
      };

      // Always create order, pass user.id if logged in (real), otherwise null
      await store.createOrder(dbUserId, cart, finalTotal, orderDetails);

      // Save Address if requested and user is logged in
      if (isRealUser && saveAddress) {
        await store.saveUserAddress(user.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        });
      }

      // Generate HTML for Order Items (Simplified for EmailJS limit)
      const orderItemsHtml = cart.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p style="margin: 0; font-weight: bold; font-size: 14px;">${item.name}</p>
                <p style="margin: 0; color: #666; font-size: 12px;">Qty: ${item.quantity} | Price: <span style="font-family: Arial, sans-serif;">&#8377;</span>${(item.price * item.quantity).toLocaleString()}</p>
            </div>
        `).join('');

      // 2. Send Emails using email service
      try {
        console.log('Sending order confirmation emails...');

        // Prepare order email parameters
        const orderParams = {
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: formData.phone,
          customerEmail: formData.email,
          orderTotal: finalTotal.toLocaleString(),
          paymentMethod: paymentMethod,
          deliveryDetails: `${formData.address}, ${formData.zipCode} | ${formData.deliveryDate} ${formData.deliveryTime}`,
          orderItems: orderItemsHtml
        };

        // Prepare user email params (needs first name only)
        const userEmailParams: OrderEmailParams = {
          customerName: `${formData.firstName} ${formData.lastName}`, // Send Full Name
          customerPhone: formData.phone,
          customerEmail: formData.email,
          orderTotal: finalTotal.toLocaleString(),
          paymentMethod: paymentMethod,
          deliveryDetails: `${formData.deliveryDate} ${formData.deliveryTime}`,
          orderItems: orderItemsHtml
        };

        // Send to user and admin in parallel
        const [userResult, adminResult] = await Promise.allSettled([
          sendOrderConfirmationToUser(userEmailParams),
          // Promise.resolve({ success: true }), // Mock success removed
          sendOrderNotificationToAdmin(orderParams)
        ]);

        // Check results
        if (userResult.status === 'fulfilled' && userResult.value.success) {
          console.log('✅ User confirmation email sent');
        } else {
          console.error('❌ User email failed:', userResult.status === 'rejected' ? userResult.reason : userResult.value.error);
        }

        if (adminResult.status === 'fulfilled' && adminResult.value.success) {
          console.log('✅ Admin notification email sent');
        } else {
          console.error('❌ Admin email failed:', adminResult.status === 'rejected' ? adminResult.reason : adminResult.value.error);
        }

        // Show success message if at least one email succeeded
        if (
          (userResult.status === 'fulfilled' && userResult.value.success) ||
          (adminResult.status === 'fulfilled' && adminResult.value.success)
        ) {
          alert('Order placed successfully! Check your email for confirmation.');
        } else {
          alert('Order placed successfully! However, email notifications may have failed. Please check your order in the account section.');
        }
      } catch (emailError: any) {
        console.error('Failed to send emails:', emailError);
        alert('Order placed successfully! However, email notifications may have failed. Please check your order in the account section.');
      }

      setProcessing(false);
      setCurrentStep(2);
      clearCart();

    } catch (error: any) {
      console.error('Order processing failed:', error);
      alert(`Something went wrong: ${error.message || JSON.stringify(error)}. Please try again.`);
      setProcessing(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('Location selected:', lat, lng);
    alert('Location pinned! Please fill in the specific address details.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshot(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
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

                  {savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Saved Addresses</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddressSelect(savedAddresses[parseInt(e.target.value)]);
                          }
                        }}
                        className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select a saved address...</option>
                        {savedAddresses.map((addr, idx) => (
                          <option key={idx} value={idx}>
                            {addr.firstName} {addr.lastName} - {addr.address}, {addr.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={handleShippingSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                      <input required type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                      <input required type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                    </div>

                    <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />

                    {/* Phone Number (No OTP) */}
                    <div className="flex-1 flex border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                      <span className="bg-gray-50 px-3 py-3 text-gray-500 border-r flex items-center font-medium">+91</span>
                      <input
                        required
                        type="tel"
                        placeholder="Mobile Number"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="flex-1 p-3 outline-none bg-white text-gray-900"
                      />
                    </div>

                    {/* Location Picker */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Pin Location</label>
                      <LocationPicker onLocationSelect={handleLocationSelect} />
                    </div>

                    <input required type="text" placeholder="Flat / House No / Building / Street" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />

                    <div className="grid grid-cols-2 gap-4">
                      <input required type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                      <input required type="text" placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <input required type="text" placeholder="Zip Code (6 digits)" value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900" />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Date</label>
                        <input
                          required
                          type="date"
                          min={getMinDate()}
                          value={formData.deliveryDate}
                          onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                          className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Time Slot</label>
                        <select
                          required
                          value={formData.deliveryTime}
                          onChange={e => setFormData({ ...formData, deliveryTime: e.target.value })}
                          className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900"
                        >
                          <option value="">Select Time</option>
                          <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                          <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                          <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                          <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Delivery Type Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-bold text-sm mb-3">Delivery Speed</p>
                      <div className="space-y-3">
                        <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${!isFastDelivery ? 'bg-white border-primary ring-1 ring-primary' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="deliverySpeed" checked={!isFastDelivery} onChange={() => setIsFastDelivery(false)} className="accent-primary w-4 h-4" />
                            <div>
                              <span className="font-bold text-sm block">Standard Delivery</span>
                              <span className="text-xs text-gray-500">Delivered in 3-5 days</span>
                            </div>
                          </div>
                          <span className="text-green-600 font-bold text-sm">Free</span>
                        </label>

                        <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${isFastDelivery ? 'bg-white border-primary ring-1 ring-primary' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="deliverySpeed" checked={isFastDelivery} onChange={() => setIsFastDelivery(true)} className="accent-primary w-4 h-4" />
                            <div>
                              <span className="font-bold text-sm block flex items-center gap-1">Fast Delivery <Icons.Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" /></span>
                              <span className="text-xs text-gray-500">Delivered within 24-48 hours</span>
                            </div>
                          </div>
                          <span className="font-bold text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>+&#8377;100</span>
                        </label>
                      </div>
                    </div>

                    {user && (
                      <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm text-gray-700">Save this address for future orders</span>
                      </label>
                    )}

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
                          <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm flex flex-col items-center w-full">
                            <p className="text-sm font-bold text-gray-700 mb-3">Scan to Pay</p>
                            <img
                              src="/upi-qr.png"
                              alt="UPI QR Code"
                              className="w-48 h-48 mb-4 border-4 border-gray-800 rounded-lg"
                            />

                            <div className="w-full border-t pt-4">
                              <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Screenshot</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                              />
                              {screenshot && (
                                <div className="mt-2">
                                  <p className="text-xs text-green-600 font-bold mb-1">Screenshot Uploaded:</p>
                                  <img src={screenshot} alt="Payment Screenshot" className="h-20 rounded border" />
                                </div>
                              )}
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
                        (paymentMethod === 'cod' ?
                          <span className="flex items-center gap-1">Place Order - <span style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;{finalTotal.toLocaleString()}</span></span> :
                          <span className="flex items-center gap-1">Confirm Payment - <span style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;{finalTotal.toLocaleString()}</span></span>)
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
                  <p className="text-textMuted mb-4">Thank you for your purchase.</p>
                  <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm mb-8">
                    <p className="font-bold">Confirmation Email Sent</p>
                    <p>We've sent the order details to {formData.email}</p>
                  </div>
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
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-0 right-0 bg-gray-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-bl-lg">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">{item.name}</h4>
                      <p className="text-gray-500 text-xs mt-1">{item.category}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium" style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({isFastDelivery ? 'Fast' : 'Standard'})</span>
                  <span className={`font-medium ${isFastDelivery ? 'text-gray-900' : 'text-green-600'}`} style={{ fontFamily: 'Arial, sans-serif' }}>
                    {isFastDelivery ? <span style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;100</span> : 'Free'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl" style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};