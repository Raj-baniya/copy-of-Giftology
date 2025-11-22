# How to Set Up EmailJS for Giftology

Follow these steps to enable real email notifications for your project.

## 1. Create an EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/) and sign up for a free account.

## 2. Add an Email Service
1. In the EmailJS Dashboard, go to **Email Services**.
2. Click **Add New Service**.
3. Select **Gmail**.
4. Click **Connect Account** and login with your `giftology.in14@gmail.com` account.
5. Click **Create Service**.
6. **Copy the Service ID** (e.g., `service_xyz123`). You will need this.

## 3. Create the Admin Template (For You)
1. Go to **Email Templates** on the left sidebar.
2. Click **Create New Template**.
3. Name it **"Admin Order Alert"**.
4. **Subject Line**: `New Order Received from {{customer_name}}`
5. **Content**: Copy and paste this exactly:
   ```html
   <h1>New Order Received!</h1>
   <p><strong>Customer Name:</strong> {{customer_name}}</p>
   <p><strong>Phone:</strong> {{customer_phone}}</p>
   <p><strong>Email:</strong> {{customer_email}}</p>
   <p><strong>Total Amount:</strong> ₹{{order_total}}</p>
   <p><strong>Payment Method:</strong> {{payment_method}}</p>
   <hr>
   <h3>Delivery Details:</h3>
   <p>{{delivery_details}}</p>
   <hr>
   <p><em>Check the Admin Panel or Database for the payment screenshot.</em></p>
   ```
6. Click **Save**.
7. **Copy the Template ID** (e.g., `template_abc456`).

## 4. Create the User Template (For Customer)
1. Go to **Email Templates** again.
2. Click **Create New Template**.
3. Name it **"User Order Confirmation"**.
4. **Subject Line**: `Order Confirmation - Giftology`
5. **Content**: Copy and paste this:
   ```html
   <h1>Hi {{to_name}},</h1>
   <p>Thank you for your order at Giftology!</p>
   <p>We have received your order of <strong>₹{{order_total}}</strong>.</p>
   <p>Your order will be delivered on: <strong>{{delivery_date}}</strong></p>
   <p>{{message}}</p>
   <hr>
   <p>If you have any questions, reply to this email.</p>
   ```
6. Click **Save**.
7. **Copy the Template ID** (e.g., `template_def789`).

## 5. Get Your Public Key
1. Go to **Account** (click your avatar in top right) -> **General**.
2. Scroll down to **API Keys**.
3. **Copy the Public Key** (it looks like `user_jK123...` or just a random string).

## 6. Update Your Code
Open `c:\Giftology.in-main\pages\Checkout.tsx` and replace the placeholders at the top of the file:

```typescript
// EmailJS Configuration
const SERVICE_ID = 'paste_your_service_id_here';
const TEMPLATE_ID_USER = 'paste_user_template_id_here';
const TEMPLATE_ID_ADMIN = 'paste_admin_template_id_here';
const PUBLIC_KEY = 'paste_your_public_key_here';
```

**That's it! Now your app will send real emails.**
