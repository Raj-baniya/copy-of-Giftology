import emailjs from '@emailjs/browser';

// EmailJS Configuration for Order Confirmations (Original Account)
const SERVICE_ID = 'service_xj1ggzr';
const TEMPLATE_ID_USER = 'template_nvj33wf';
const TEMPLATE_ID_ADMIN = 'template_wv9628g';
const PUBLIC_KEY = 'WPCiv1-vH_EzNaI1l';

// EmailJS Configuration for Mobile Number Submissions (Second Account)
const MOBILE_SERVICE_ID = 'service_0qvjc19';
const TEMPLATE_ID_MOBILE = 'template_87o28wf';
const MOBILE_PUBLIC_KEY = 'h0kv_A348FOP9ZzrT';

// EmailJS doesn't require explicit initialization in v4+
// Public key is passed directly to send() method
// But we'll ensure it's available for compatibility
console.log('EmailJS Order Service initialized:', PUBLIC_KEY ? '✓' : '✗');
console.log('EmailJS Mobile Service initialized:', MOBILE_PUBLIC_KEY ? '✓' : '✗');

export interface MobileNumberSubmission {
  name: string;
  mobileNumber: string;
  email: string;
}

export interface OrderEmailParams {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderTotal: string;
  paymentMethod: string;
  deliveryDetails: string;
  orderItems?: string;
}

/**
 * Send user details (name, mobile, email) submission email to admin
 */
export const sendMobileNumberToAdmin = async (data: MobileNumberSubmission): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Attempting to send user details to admin:', data);

    // Prepare email parameters for admin
    // Template expects: user_name, user_mobile, user_email, submission_time, source
    const emailParams = {
      to_email: 'giftology.in14@gmail.com',
      user_name: data.name,
      user_mobile: `+91 ${data.mobileNumber}`,
      user_email: data.email,
      submission_time: new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'long',
        timeStyle: 'medium'
      }),
      source: 'Website Landing Page - Mobile Number Collection Modal'
    };

    console.log('Email params prepared:', emailParams);

    // Send email via EmailJS using the SECOND account for mobile submissions
    const response = await emailjs.send(MOBILE_SERVICE_ID, TEMPLATE_ID_MOBILE, emailParams, MOBILE_PUBLIC_KEY);

    console.log('EmailJS response:', response);

    if (response.status === 200) {
      console.log('✅ User details email sent successfully!');
      return { success: true };
    } else {
      throw new Error(`EmailJS returned status: ${response.status}`);
    }

  } catch (error: any) {
    console.error('❌ Failed to send user details email:', error);

    // Provide detailed error information
    const errorMessage = error?.text || error?.message || 'Unknown error occurred';
    console.error('Error details:', {
      status: error?.status,
      text: error?.text,
      message: error?.message,
      error: JSON.stringify(error)
    });

    return {
      success: false,
      error: errorMessage
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
      to_name: params.customerName.split(' ')[0], // First name
      to_email: params.customerEmail,
      order_total: params.orderTotal,
      delivery_date: params.deliveryDetails.split('|')[0]?.trim() || 'TBD',
      order_items: params.orderItems || '',
      message: `Thank you for your order! We will deliver it as per the scheduled date.`
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

    const adminEmailParams = {
      to_email: 'giftology.in14@gmail.com',
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
