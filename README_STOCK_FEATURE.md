# Stock Management Feature

This feature allows you to manage product stock levels and display them to customers.

## Features Implemented

1.  **Admin Dashboard**:
    - View current stock levels in the Product Inventory table.
    - Edit stock quantity when adding or editing a product.
    - Stock is saved to the `stock_quantity` column in the Supabase `products` table.

2.  **Product Detail Page**:
    - Displays "In Stock" or "Out of Stock" status.
    - Shows "Only X left!" if stock is less than 10.
    - Disables the "Add to Cart" button if the product is out of stock.

3.  **Shop Page**:
    - Displays an "Out of Stock" overlay on products with 0 stock.
    - Disables the "Add" button for out-of-stock items.

4.  **Database**:
    - Uses the existing `stock_quantity` column in the `products` table.
    - No new database is strictly required if you are using the provided `SUPABASE_SCHEMA.sql`.

## How to Verify

1.  **Admin**: Log in as an admin, go to the dashboard, edit a product, change the stock, and save.
2.  **Shop**: Go to the shop page, find that product, and verify the stock status matches.
3.  **Database**: Run the `CHECK_STOCK_SCHEMA.sql` script in your Supabase SQL Editor to confirm the column exists.
