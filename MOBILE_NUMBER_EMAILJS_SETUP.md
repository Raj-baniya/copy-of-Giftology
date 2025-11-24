# EmailJS Template Setup for Mobile Number Collection

This guide will help you set up the EmailJS template for receiving mobile number submissions from your website.

## 📋 Prerequisites

- An EmailJS account (free account works fine)
- Access to EmailJS dashboard
- Your EmailJS Service ID and Public Key

## 🚀 Setup Steps

### Step 1: Access EmailJS Templates

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Log in to your account
3. Navigate to **Email Templates** in the left sidebar
4. Click **Create New Template**

### Step 2: Configure the Template

1. **Template Name**: Enter `Mobile Number Submission` or `Visitor Contact Info`

2. **Subject Line**: Use this:
   ```
   New Visitor Contact: {{user_name}} - {{user_mobile}}
   ```

3. **Content Type**: Make sure **"Content is HTML"** is checked

4. **Template Content**: 
   - Open the file `MOBILE_NUMBER_EMAIL_TEMPLATE.html` in your project
   - Copy the entire HTML content (starting from the `<div style="max-width: 600px...">` inside the body)
   - Paste it into the EmailJS template editor
   - **Important**: Make sure you're pasting in the HTML/Code view, not the visual editor

### Step 3: Configure Email Service

1. Go to **Email Services** in EmailJS dashboard
2. Make sure you have a service connected (e.g., Gmail)
3. Note your **Service ID** (should be `service_xj1ggzr` if already set up)

4. In the template settings:
   - **To Email**: `giftology.in14@gmail.com` (or your admin email)
   - **From Name**: `Giftology Website`
   - **Reply To**: `{{user_email}}` (this allows you to reply directly to the visitor)

### Step 4: Get Your Template ID

1. After saving the template, you'll see a **Template ID** 
2. Copy this Template ID (it looks like `template_xxxxxxx`)
3. Update the `TEMPLATE_ID_MOBILE` constant in `services/emailService.ts`

### Step 5: Update Your Code

Open `services/emailService.ts` and update the template ID:

```typescript
const TEMPLATE_ID_MOBILE = 'YOUR_NEW_TEMPLATE_ID_HERE'; // Replace with your template ID
```

## 📧 Template Variables

The template uses these variables (make sure they match exactly):

- `{{user_name}}` - Visitor's name
- `{{user_mobile}}` - Visitor's mobile number (format: +91 XXXXXXXXXX)
- `{{user_email}}` - Visitor's email address
- `{{submission_time}}` - Timestamp of submission
- `{{source}}` - Source of submission (e.g., "Website Landing Page")
- `{{to_email}}` - Admin email address (giftology.in14@gmail.com)

## ✅ Testing

1. After setting up the template, test it:
   - Visit your website
   - Fill out the mobile number form
   - Submit it
   - Check your email (giftology.in14@gmail.com)

2. Check the browser console (F12) for any errors:
   - Look for: `EmailJS response:`
   - Look for: `✅ User details email sent successfully!`

## 🔧 Troubleshooting

### Email Not Receiving

1. **Check Template ID**: Make sure the Template ID in your code matches the one in EmailJS dashboard
2. **Check Service ID**: Verify your Service ID is correct
3. **Check Public Key**: Ensure your Public Key is valid
4. **Check Email Service**: Make sure your email service (Gmail) is properly connected
5. **Check Spam Folder**: Sometimes emails go to spam

### Template Not Rendering Correctly

1. Make sure **"Content is HTML"** is checked in EmailJS template settings
2. Verify you copied the entire HTML content correctly
3. Test the template manually in EmailJS dashboard using the "Test" button

### Variables Not Showing

1. Ensure variable names match exactly (case-sensitive)
2. Check that variables are wrapped in double curly braces: `{{variable_name}}`
3. Verify your code is sending the correct parameter names

## 📝 Current Configuration

Your current EmailJS configuration (from `services/emailService.ts`):

- **Service ID**: `service_xj1ggzr`
- **Public Key**: `WPCiv1-vH_EzNaI1l`
- **Admin Email**: `giftology.in14@gmail.com`

## 🎨 Customizing the Template

You can customize the email template by:

1. Editing `MOBILE_NUMBER_EMAIL_TEMPLATE.html`
2. Adjusting colors to match your brand
3. Adding your logo
4. Modifying the layout

After making changes, copy the updated HTML into your EmailJS template.

## 📞 Support

If you encounter any issues:

1. Check EmailJS documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
2. Check browser console for error messages
3. Verify all IDs and keys are correct
4. Test with EmailJS's built-in test feature

---

**Ready to go!** Once you've set up the template and updated the Template ID in your code, the mobile number collection form will send beautifully formatted emails to your admin email with all visitor details.

