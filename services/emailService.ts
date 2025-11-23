import emailjs from '@emailjs/browser';

// EmailJS Configuration for Order Confirmations (Original Account)
const SERVICE_ID = 'service_xj1ggzr';
const TEMPLATE_ID_USER = 'template_nvj33wf';
const TEMPLATE_ID_ADMIN = 'template_wv9628g';
const PUBLIC_KEY = 'WPCiv1-vH_EzNaI1l';

// EmailJS Configuration for Mobile Number Submissions (Second Account)
const MOBILE_SERVICE_ID = 'service_0qvjc19';
const TEMPLATE_ID_MOBILE = 'template_ip79ecc'; // Admin Notification Template
const TEMPLATE_ID_OTP = 'template_pm54r24';    // User OTP Template
const MOBILE_PUBLIC_KEY = 'h0kv_A348FOP9ZzrT';

// EmailJS doesn't require explicit initialization in v4+
// Public key is passed directly to send() method
// But we'll ensure it's available for compatibility
console.log('EmailJS Order Service initialized:', PUBLIC_KEY ? '✓' : '✗');
console.log('EmailJS Mobile Service initialized:', MOBILE_PUBLIC_KEY ? '✓' : '✗');

export interface FeedbackSubmission {
  name: string;
  email: string;
  mobileNumber: string;
  message: string;
}

export interface OrderEmailParams {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderTotal: string;
  paymentMethod: string;
  deliveryDetails: string;
  orderItems?: string;
  view_order_url?: string;
}

/**
 * Send feedback/contact form submission to admin
 * Uses the Second EmailJS Service (Mobile Service)
 */
export const sendFeedbackToAdmin = async (data: FeedbackSubmission): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Attempting to send feedback to admin:', data);

    // Prepare email parameters for admin
    const emailParams = {
      to_email: 'giftology.in14@gmail.com',
      user_name: data.name,
      user_mobile: `+91 ${data.mobileNumber}`,
      user_email: data.email,
      message: data.message, // Added feedback message
      submission_time: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'long',
        timeStyle: 'medium'
      }),
      source: 'Website Feedback Form'
    };

    console.log('Email params prepared:', emailParams);

    // Send email via EmailJS using the SECOND account
    const response = await emailjs.send(MOBILE_SERVICE_ID, TEMPLATE_ID_MOBILE, emailParams, MOBILE_PUBLIC_KEY);

    console.log('EmailJS response:', response);

    if (response.status === 200) {
      console.log('✅ Feedback email sent successfully!');
      return { success: true };
    } else {
      throw new Error(`EmailJS returned status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('❌ Failed to send feedback email:', error);
    return {
      success: false,
      error: error?.text || error?.message || 'Unknown error occurred'
    };
  }
};

/**
 * Send order confirmation email to user
 */
export const sendOrderConfirmationToUser = async (params: OrderEmailParams): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 Attempting to send order confirmation to user:', params.customerEmail);

    const userEmailParams = {
      // Standard fields
      to_name: params.customerName.split(' ')[0],
      to_email: params.customerEmail,

      // Fallback fields to ensure compatibility
      customer_name: params.customerName,
      user_name: params.customerName,
      name: params.customerName,

      email: params.customerEmail,
      user_email: params.customerEmail,
      recipient_email: params.customerEmail,

      // Add MISSING fields that caused "Half Filled" email
      customer_phone: params.customerPhone,
      payment_method: params.paymentMethod,
      delivery_details: params.deliveryDetails,

      order_total: params.orderTotal,
      delivery_date: params.deliveryDetails.split('|')[0]?.trim() || 'TBD',
      order_items: params.orderItems || '',
      message: `Thank you for your order! We will deliver it as per the scheduled date.`,
      view_order_url: `${window.location.origin}/account` // Dynamic link to Account page
    };

    console.log('📧 User email params:', userEmailParams);
    console.log('📧 Using Service ID:', SERVICE_ID);
    console.log('📧 Using Template ID:', TEMPLATE_ID_USER);

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_USER, userEmailParams, PUBLIC_KEY);

    if (response.status === 200) {
      console.log('✅ User confirmation email sent successfully!');
      return { success: true };
    } else {
      throw new Error(`EmailJS returned status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('❌ Failed to send user confirmation email:', error);
    console.error('❌ Error details:', {
      status: error?.status,
      text: error?.text,
      message: error?.message,
      name: error?.name
    });
    return {
      success: false,
      error: error?.text || error?.message || 'Unknown error occurred'
    };
  }
};

/**
 * Send new order notification email to admin
 */
export const sendOrderNotificationToAdmin = async (params: OrderEmailParams): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 Attempting to send order notification to admin');

    const adminEmail = 'giftology.in14@gmail.com';

    const adminEmailParams = {
      to_email: adminEmail,

      // Fallback fields
      email: adminEmail,
      user_email: adminEmail,
      recipient_email: adminEmail,

      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      customer_email: params.customerEmail,
      order_total: params.orderTotal,
      payment_method: params.paymentMethod,
      delivery_details: params.deliveryDetails,
      order_items: params.orderItems || '',
      message: 'New Order Received! Check Admin Panel for details.'
    };

    console.log('📧 Admin email params:', adminEmailParams);
    console.log('📧 Using Service ID:', SERVICE_ID);
    console.log('📧 Using Template ID:', TEMPLATE_ID_ADMIN);

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID_ADMIN, adminEmailParams, PUBLIC_KEY);

    if (response.status === 200) {
      console.log('✅ Admin order notification email sent successfully!');
      return { success: true };
    } else {
      throw new Error(`EmailJS returned status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('❌ Failed to send admin order notification email:', error);
    console.error('❌ Error details:', {
      status: error?.status,
      text: error?.text,
      message: error?.message,
      name: error?.name
    });
    return {
      success: false,
      error: error?.text || error?.message || 'Unknown error occurred'
    };
  }
};

/**
 * Send OTP to user via Email
 * Uses the Second EmailJS Service (Mobile Service) with specific OTP Template
 */
export const sendOtpToUser = async (name: string, email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('📧 Attempting to send OTP to user:', email);

    const otpEmailParams = {
      to_name: name,
      to_email: email,
      email: email,           // Fallback 1
      user_email: email,      // Fallback 2
      recipient_email: email, // Fallback 3
      otp: otp,
      message: `Your One-Time Password (OTP) for Giftology verification is: ${otp}. Do not share this with anyone.`
    };

    // Use MOBILE_SERVICE_ID and TEMPLATE_ID_OTP
    const response = await emailjs.send(MOBILE_SERVICE_ID, TEMPLATE_ID_OTP, otpEmailParams, MOBILE_PUBLIC_KEY);

    if (response.status === 200) {
      console.log('✅ OTP email sent successfully!');
      return { success: true };
    } else {
      throw new Error(`EmailJS returned status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('❌ Failed to send OTP email:', error);
    return {
      success: false,
      error: error?.text || error?.message || 'Unknown error occurred'
    };
  }
};
