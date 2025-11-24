-- RUN THIS IN SUPABASE SQL EDITOR TO FIX ALL PERMISSION ISSUES

-- ==========================================
-- 1. PRODUCTS TABLE (Fixes "Add Product" Error)
-- ==========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Remove conflicting policies
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable all access for everyone" ON products;

-- Allow EVERYONE to VIEW products
CREATE POLICY "Enable read access for all users" 
ON products FOR SELECT 
USING (true);

-- Allow AUTHENTICATED users (Admins) to INSERT products
CREATE POLICY "Enable insert for authenticated users only" 
ON products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow AUTHENTICATED users (Admins) to UPDATE products
CREATE POLICY "Enable update for authenticated users only" 
ON products FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow AUTHENTICATED users (Admins) to DELETE products
CREATE POLICY "Enable delete for authenticated users only" 
ON products FOR DELETE 
USING (auth.role() = 'authenticated');


-- ==========================================
-- 2. CATEGORIES TABLE
-- ==========================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON categories;

-- Allow EVERYONE to VIEW categories
CREATE POLICY "Enable read access for all users" 
ON categories FOR SELECT 
USING (true);

-- Allow AUTHENTICATED users to MANAGE categories
CREATE POLICY "Enable all access for authenticated users" 
ON categories FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- ==========================================
-- 3. ORDERS TABLE (Fixes Guest Checkout)
-- ==========================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON orders;

-- Allow EVERYONE to INSERT orders (Guest Checkout)
CREATE POLICY "Enable insert for everyone" 
ON orders FOR INSERT 
WITH CHECK (true);

-- Allow Users to VIEW their own orders (and Admins to view all)
CREATE POLICY "Enable read access for users based on user_id" 
ON orders FOR SELECT 
USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Allow Admins to UPDATE orders (Status changes)
CREATE POLICY "Enable update for authenticated users" 
ON orders FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- ==========================================
-- 4. ORDER ITEMS TABLE
-- ==========================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone" ON order_items;
DROP POLICY IF EXISTS "Enable read access for everyone" ON order_items;

-- Allow EVERYONE to INSERT order items
CREATE POLICY "Enable insert for everyone" 
ON order_items FOR INSERT 
WITH CHECK (true);

-- Allow EVERYONE to READ order items (simplifies logic)
CREATE POLICY "Enable read access for everyone" 
ON order_items FOR SELECT 
USING (true);


-- ==========================================
-- 5. CONTACT MESSAGES
-- ==========================================
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for everyone" ON contact_messages;

CREATE POLICY "Enable insert for everyone" 
ON contact_messages FOR INSERT 
WITH CHECK (true);

-- Allow Admins to VIEW messages
CREATE POLICY "Enable read access for authenticated users" 
ON contact_messages FOR SELECT 
USING (auth.role() = 'authenticated');
