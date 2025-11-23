-- !!! IMPORTANT: RUN THIS SCRIPT IN SUPABASE SQL EDITOR !!!

-- This script fixes the "row-level security policy" error for Guest Checkout.

-- 1. Fix ORDERS table policy
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.orders;

CREATE POLICY "Enable insert for everyone" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- 2. Fix ORDER_ITEMS table policy
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.order_items;

CREATE POLICY "Enable insert for everyone" 
ON public.order_items 
FOR INSERT 
WITH CHECK (true);

-- 3. Fix CONTACT_MESSAGES table policy (for Feedback form)
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.contact_messages;

CREATE POLICY "Enable insert for everyone" 
ON public.contact_messages 
FOR INSERT 
WITH CHECK (true);

-- 4. Grant usage on schema (just in case)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
