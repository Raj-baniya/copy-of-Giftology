# Firebase Deployment Guide

## Problem: Website Goes Blank After Deployment

### Root Cause
The blank page issue occurs because Firebase Hosting doesn't know how to handle client-side routing (React Router). When you navigate to a route like `/shop` or refresh the page, Firebase looks for a file at that path and returns a 404 error.

### Solution
The `firebase.json` file has been configured with **rewrites** that redirect all requests to `index.html`, allowing React Router to handle the routing on the client side.

---

## Deployment Steps

### 1. **Update Firebase Project ID**
Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 2. **Build the Project**
```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 3. **Deploy to Firebase**

**Option A: Deploy everything**
```bash
npm run deploy
```

**Option B: Deploy only hosting**
```bash
npm run deploy:hosting
```

**Option C: Manual deployment**
```bash
firebase deploy --only hosting
```

---

## Important Configuration Details

### firebase.json Configuration
- **public**: `"dist"` - Points to the Vite build output directory
- **rewrites**: All routes (`**`) redirect to `/index.html` for client-side routing
- **headers**: Caching headers for static assets (images, fonts, CSS, JS)

### What This Fixes
✅ Blank page on route navigation  
✅ 404 errors on page refresh  
✅ Direct URL access to routes  
✅ Proper client-side routing  

---

## Troubleshooting

### Issue: Still seeing blank pages
1. Clear your browser cache
2. Check the browser console for errors
3. Verify the build completed successfully
4. Ensure `.env` variables are set correctly

### Issue: Firebase CLI not found
Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

Then login:
```bash
firebase login
```

### Issue: Wrong project deployed
Check your Firebase project:
```bash
firebase projects:list
```

Switch project if needed:
```bash
firebase use your-project-id
```

---

## Pre-Deployment Checklist

- [ ] Environment variables are set in Firebase Hosting settings
- [ ] `.firebaserc` has the correct project ID
- [ ] Build completes without errors (`npm run build`)
- [ ] Test the build locally (`npm run preview`)
- [ ] All API keys and secrets are configured in Firebase Console

---

## Environment Variables in Firebase

Since `.env` files are not deployed, you need to set environment variables in your code or use Firebase Functions config:

### For Vite Projects:
Environment variables must be prefixed with `VITE_` to be exposed to the client:

```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_EMAILJS_SERVICE_ID=your-service-id
```

These are automatically included in the build when you run `npm run build`.

---

## Post-Deployment

After deploying, test these scenarios:
1. Navigate to different routes
2. Refresh the page on a route (e.g., `/shop`)
3. Use the browser back/forward buttons
4. Access routes directly via URL

All should work without blank pages! 🎉
