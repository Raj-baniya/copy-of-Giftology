# How to Upload Product Images Correctly

The reason your Google Drive images are not showing up is that the link you copy from Google Drive is a **Viewer Link** (a webpage that shows the image), not a **Direct Image Link** (the actual image file itself).

Here are the 3 best ways to fix this, ranked from easiest to best.

---

## Option 1: Use a Free Image Hosting Site (Easiest & Fastest)
If you just want to get it working right now without any setup.

1.  Go to a free image hosting site like **[ImgBB.com](https://imgbb.com/)** (Recommended) or **[Imgur.com](https://imgur.com/)**.
2.  Upload your product image there.
3.  **Crucial Step:** Once uploaded, look for the **"Direct Link"**.
    *   It must end in `.jpg`, `.png`, or `.webp`.
    *   *Example:* `https://i.postimg.cc/kXq1z/my-product.jpg`
4.  Copy that **Direct Link**.
5.  Paste this link into the "Image URL" field in your Giftology Admin Panel.

---

## Option 2: Use Supabase Storage (Best for Long Term)
Since your project already uses Supabase, this is the most professional way.

1.  **Log in to your Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2.  Go to the **Storage** tab (icon looks like a bucket) on the left sidebar.
3.  Click **"New Bucket"**.
    *   Name it: `products`
    *   **Public bucket**: Toggle this to **ON** (This is important!).
    *   Click "Save".
4.  Click on the new `products` bucket to open it.
5.  Click **"Upload File"** and select your product image.
6.  Once uploaded, click on the file name.
7.  Click the **"Get URL"** button on the right side.
8.  Copy that URL and paste it into your Admin Panel.

---

## Option 3: Fix Your Google Drive Links (The "Hack")
If you *really* want to keep using Google Drive, you have to convert the link.

1.  In Google Drive, right-click your image > **Share** > **Copy Link**.
    *   *Make sure access is set to "Anyone with the link".*
2.  The link will look like this:
    *   `https://drive.google.com/file/d/123456789ABCDEF/view?usp=sharing`
3.  You need to change it to this format:
    *   `https://drive.google.com/uc?export=view&id=123456789ABCDEF`
    *   *(Replace `123456789ABCDEF` with your actual file ID from the original link)*.
4.  **Warning:** This is slower and Google sometimes blocks it for websites. **Option 1 or 2 is much better.**

---

### Summary Checklist
- [ ] Does your link end in `.jpg`, `.png`, or `.webp`? (It should!)
- [ ] If you paste the link in a new browser tab, does it show *only* the image (no Google Drive interface)?
