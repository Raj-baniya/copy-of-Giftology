import { Product, User, Order } from '../types';
import * as supabaseService from './supabaseService';

class StoreService {
  constructor() {
    // No init needed for Supabase
  }

  // Helper to format IDs
  private formatId(id: string | number): string {
    if (typeof id === 'number' || (typeof id === 'string' && !isNaN(Number(id)))) {
      return String(id).padStart(5, '0');
    }
    return String(id);
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    const dbProducts = await supabaseService.getProducts();
    // Map DB product to Frontend Product type
    return (dbProducts || []).map((p: any) => ({
      id: this.formatId(p.id), // Format ID
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      marketPrice: p.market_price,
      imageUrl: p.images?.[0] || '',
      images: p.images || [],
      category: p.categories?.slug || 'uncategorized',
      trending: p.is_featured,
      stock: p.stock_quantity
    }));
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const p = await supabaseService.getProductBySlug(slug);
    if (!p) return null;
    return {
      id: this.formatId(p.id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      marketPrice: p.market_price,
      imageUrl: p.images?.[0] || '',
      images: p.images || [],
      category: p.categories?.slug || 'uncategorized',
      trending: p.is_featured,
      stock: p.stock_quantity
    };
  }

  async getCategories() {
    return await supabaseService.getCategories();
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct = await supabaseService.addProduct(product);
    return {
      id: this.formatId(newProduct.id),
      name: newProduct.name,
      slug: newProduct.slug,
      description: newProduct.description,
      price: newProduct.price,
      marketPrice: newProduct.market_price,
      imageUrl: newProduct.images?.[0] || '',
      images: newProduct.images || [],
      category: product.category, // Optimistic
      trending: newProduct.is_featured,
      stock: newProduct.stock_quantity
    };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const updated = await supabaseService.updateProduct(id, updates);
    return {
      id: this.formatId(updated.id),
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      price: updated.price,
      marketPrice: updated.market_price,
      imageUrl: updated.images?.[0] || '',
      images: updated.images || [],
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

  // --- Address Management ---
  async getUserAddresses(userId: string): Promise<any[]> {
    const profile = await supabaseService.getUserProfile(userId);
    return profile?.addresses || [];
  }

  async saveUserAddress(userId: string, address: any): Promise<any[]> {
    const currentAddresses = await this.getUserAddresses(userId);
    // Check for duplicates (simple check)
    const exists = currentAddresses.some(a =>
      a.address === address.address &&
      a.city === address.city &&
      a.state === address.state &&
      a.zipCode === address.zipCode
    );

    if (exists) return currentAddresses;

    const newAddresses = [...currentAddresses, address];
    await supabaseService.updateUserProfile(userId, { addresses: newAddresses });
    return newAddresses;
  }

  async deleteUserAddress(userId: string, index: number): Promise<any[]> {
    const currentAddresses = await this.getUserAddresses(userId);
    if (index >= 0 && index < currentAddresses.length) {
      const newAddresses = currentAddresses.filter((_, i) => i !== index);
      await supabaseService.updateUserProfile(userId, { addresses: newAddresses });
      return newAddresses;
    }
    return currentAddresses;
  }

  // --- Orders ---
  async createOrder(userId: string, items: any[], total: number, details: any): Promise<Order> {
    const orderData: any = {
      total: total,
      status: 'Processing',
      shipping_address: {
        ...details.shippingAddress,
        // HACK: Storing screenshot and extra details in shipping_address JSONB to ensure they are saved
        // without needing a schema migration (if the table is strict)
        payment_proof: details.screenshot,
        customer_name: details.customerName,
        customer_phone: details.phone,
        customer_email: details.email,
        delivery_type: details.deliveryType,
        delivery_date: details.deliveryDate
      },
      payment_method: details.paymentMethod,
      guest_info: !userId ? details.guestInfo : null
    };

    if (userId) {
      orderData.user_id = userId;
    }

    const result = await supabaseService.createOrder(orderData, items);
    if (!result.success) throw result.error;

    // Return a frontend-compatible Order object
    return {
      id: this.formatId(result.order.id),
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

    return (dbOrders || []).map((o: any) => {
      // Extract details from shipping_address (where we stored them) or guest_info
      let shipping = o.shipping_address || {};

      // Handle case where shipping_address is a string (JSON stringified)
      if (typeof shipping === 'string') {
        try {
          shipping = JSON.parse(shipping);
        } catch (e) {
          console.error('Failed to parse shipping_address:', e);
          shipping = {};
        }
      }

      let guest = o.guest_info || {};
      // Handle case where guest_info is a string
      if (typeof guest === 'string') {
        try {
          guest = JSON.parse(guest);
        } catch (e) {
          guest = {};
        }
      }

      return {
        id: this.formatId(o.id),
        userId: o.user_id,
        date: o.created_at,
        items: o.order_items.map((i: any) => ({
          id: this.formatId(i.product_id),
          name: i.products?.name || 'Unknown Product',
          price: i.unit_price,
          quantity: i.quantity,
          imageUrl: i.products?.images?.[0] || ''
        })),
        total: o.total,
        status: o.status,
        shippingAddress: shipping,

        // Map the new fields
        customerName: shipping.customer_name || (guest.firstName ? `${guest.firstName} ${guest.lastName}` : 'Unknown'),
        phone: shipping.customer_phone || guest.phone,
        email: shipping.customer_email || guest.email,
        address: `${shipping.street || ''}, ${shipping.city || ''} - ${shipping.zipCode || ''}`,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.zipCode,
        paymentMethod: o.payment_method,
        screenshot: shipping.payment_proof, // Retrieve screenshot
        deliveryType: shipping.delivery_type
      };
    });
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