# How to Fix Database Connection on Firebase Deployment

The reason your deployed site (`https://giftology-61199531-fda86.web.app/`) is not storing data is that it doesn't know your Supabase credentials. You need to provide them.

## Step 1: Add Environment Variables to Your Build
If you are deploying manually (running `npm run build` then `firebase deploy`), ensure you have a `.env.production` file in your project root with the following content:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

*(Replace `your_supabase_url_here` and `your_supabase_anon_key_here` with your actual keys from `.env`)*.

**Then run:**
1.  `npm run build`
2.  `firebase deploy`

## Step 2: Configure Supabase Authentication
Supabase needs to know your new Firebase URL to allow logins.

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication** -> **URL Configuration**.
3.  In **Site URL**, enter: `https://giftology-61199531-fda86.web.app`
4.  In **Redirect URLs**, add:
    *   `https://giftology-61199531-fda86.web.app/**`
5.  Click **Save**.

## Step 3: Resetting IDs to Start from 00001
To make your Product and Order IDs start from `00001`, you need to reset your database tables. **WARNING: This will delete all existing data.**

Run this SQL in your Supabase SQL Editor:

```sql
-- TRUNCATE deletes all data and RESTART IDENTITY resets the ID counter to 1
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
```

*Note: This only works if your IDs are numbers (Integers). If your IDs are random letters (UUIDs), you cannot change them to 00001 easily.*
