-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE "RLS POLICY" ERROR

-- 1. Allow ANYONE (Guests + Users) to create an Order
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON orders;
DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;

CREATE POLICY "Enable insert for everyone" 
ON orders 
FOR INSERT 
WITH CHECK (true);

-- 2. Allow ANYONE to create Order Items
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON order_items;
DROP POLICY IF EXISTS "Enable insert for everyone" ON order_items;

CREATE POLICY "Enable insert for everyone" 
ON order_items 
FOR INSERT 
WITH CHECK (true);

-- 3. Allow ANYONE to create Contact Messages (Feedback)
DROP POLICY IF EXISTS "Enable insert for everyone" ON contact_messages;

CREATE POLICY "Enable insert for everyone" 
ON contact_messages 
FOR INSERT 
WITH CHECK (true);
