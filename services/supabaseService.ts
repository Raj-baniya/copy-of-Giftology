import { supabase } from './supabaseClient';

// Types
export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    images: string[];
    category_id: string;
    is_featured: boolean;
    is_active: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
}

export interface ContactMessage {
    name: string;
    email?: string;
    phone?: string;
    message?: string;
    source?: string;
}

// --- Products ---

export const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data;
};

export const getFeaturedProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
    return data;
};

export const getProductBySlug = async (slug: string) => {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }
    return data;
};

// --- Categories ---

export const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
};

// --- Contact / Mobile Submissions ---

export const submitContactMessage = async (messageData: ContactMessage) => {
    const { data, error } = await supabase
        .from('contact_messages')
        .insert([messageData])
        .select();

    if (error) {
        console.error('Error submitting message:', error);
        return { success: false, error };
    }
    return { success: true, data };
};

// --- Orders ---

export const createOrder = async (orderData: any, orderItems: any[]) => {
    // 1. Create the order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

    if (orderError) {
        console.error('Error creating order:', orderError);
        return { success: false, error: orderError };
    }

    // 2. Prepare order items with the new order_id
    const itemsWithOrderId = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
    }));

    // 3. Insert order items
    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId);

    if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Ideally, you would rollback the order here (or use a stored procedure/RPC)
        return { success: false, error: itemsError };
    }

    return { success: true, order };
};

// --- Admin Functions ---

export const getAdminOrders = async () => {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching admin orders:', error);
        return [];
    }
    return data;
};

export const getContactMessages = async () => {
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching contact messages:', error);
        return [];
    }
    return data;
};
