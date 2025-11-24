-- Check if stock_quantity column exists in products table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'stock_quantity';

-- If you want to reset all stock to a default value (e.g., 50), uncomment and run:
-- UPDATE public.products SET stock_quantity = 50;

-- Verify RLS policies allow updating products (Admin only)
SELECT * FROM pg_policies WHERE tablename = 'products';
