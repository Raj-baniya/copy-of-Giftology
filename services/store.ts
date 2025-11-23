import { Product, User, Order } from '../types';
import * as supabaseService from './supabaseService';

class StoreService {
  constructor() {
    // No init needed for Supabase
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    const dbProducts = await supabaseService.getProducts();
    // Map DB product to Frontend Product type
    return dbProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      imageUrl: p.images?.[0] || '',
      category: p.categories?.slug || 'uncategorized',
      trending: p.is_featured,
      stock: p.stock_quantity
    }));
  }

  async getCategories() {
    return await supabaseService.getCategories();
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct = await supabaseService.addProduct(product);
    return {
      id: newProduct.id,
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description,
      price: newProduct.price,
      imageUrl: newProduct.images?.[0] || '',
      category: product.category, // Optimistic
      trending: newProduct.is_featured,
      stock: newProduct.stock_quantity
    };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const updated = await supabaseService.updateProduct(id, updates);
    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      price: updated.price,
      imageUrl: updated.images?.[0] || '',
      category: updates.category || 'uncategorized',
      trending: updated.is_featured,
      stock: updated.stock_quantity
    };
  }

  async deleteProduct(id: string): Promise<void> {
    await supabaseService.deleteProduct(id);
  }

  // --- Users ---
  // Users are handled by Clerk + Supabase Auth, but we keep this for compatibility if used elsewhere
  async getUser(email: string): Promise<User | null> {
    // This is legacy from mock store. Ideally we use useAuth() context.
    return null;
  }

  async createUser(user: Omit<User, 'id' | 'joinDate' | 'role'>): Promise<User> {
    // Legacy
    return {} as User;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    // Legacy
    return {} as User;
  }

  // --- Orders ---
  async createOrder(userId: string, items: any[], total: number, details: any): Promise<Order> {
    const orderData = {
      user_id: userId, // Might be null for guest
      total: total,
      status: 'Processing',
      shipping_address: details.shippingAddress,
      payment_method: details.paymentMethod,
      guest_info: !userId ? details.guestInfo : null
    };

    const result = await supabaseService.createOrder(orderData, items);
    if (!result.success) throw result.error;

    // Return a frontend-compatible Order object
    return {
      id: result.order.id,
      userId,
      date: result.order.created_at,
      items,
      total,
      status: 'Processing',
      ...details
    };
  }

  async getOrders(userId?: string): Promise<Order[]> {
    let dbOrders;
    if (userId) {
      dbOrders = await supabaseService.getUserOrders(userId);
    } else {
      dbOrders = await supabaseService.getAdminOrders();
    }

    return dbOrders.map((o: any) => ({
      id: o.id,
      userId: o.user_id,
      date: o.created_at,
      items: o.order_items.map((i: any) => ({
        id: i.product_id,
        name: i.products?.name || 'Unknown Product',
        price: i.unit_price,
        quantity: i.quantity
      })),
      total: o.total,
      status: o.status,
      shippingAddress: o.shipping_address
    }));
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const updated = await supabaseService.updateOrderStatus(orderId, status);
    return {
      id: updated.id,
      status: updated.status
    } as any;
  }
}

export const store = new StoreService();