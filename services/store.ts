import { Product, User, Order } from '../types';
import { INITIAL_PRODUCTS } from './mockData';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Keys
const KEYS = {
  PRODUCTS: 'giftology_products',
  USERS: 'giftology_users',
  ORDERS: 'giftology_orders',
  CURRENT_USER: 'giftology_current_user',
};

class StoreService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
  }

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    await delay(300);
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    await delay(500);
    const products = await this.getProducts();
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    products.push(newProduct);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay(300);
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    const updated = { ...products[index], ...updates };
    products[index] = updated;
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
  }

  // --- Users ---
  async getUser(email: string): Promise<User | null> {
    const usersStr = localStorage.getItem(KEYS.USERS);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    return users.find(u => u.email === email) || null;
  }

  async createUser(user: Omit<User, 'id' | 'joinDate' | 'role'>): Promise<User> {
    await delay(500);
    const usersStr = localStorage.getItem(KEYS.USERS);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substr(2, 9),
      joinDate: new Date().toISOString(),
      role: 'user',
    };
    
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
     const usersStr = localStorage.getItem(KEYS.USERS);
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const idx = users.findIndex(u => u.id === userId);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      return users[idx];
    }
    throw new Error('User not found');
  }

  // --- Orders ---
  async createOrder(userId: string, items: any[], total: number): Promise<Order> {
    await delay(800);
    const ordersStr = localStorage.getItem(KEYS.ORDERS);
    const orders: Order[] = ordersStr ? JSON.parse(ordersStr) : [];
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      items,
      total,
      status: 'Processing'
    };

    // Save order
    // In a real app, we'd filter by userId. Here we just store all.
    orders.push(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    await delay(300);
    const ordersStr = localStorage.getItem(KEYS.ORDERS);
    return ordersStr ? JSON.parse(ordersStr) : [];
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    await delay(300);
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) throw new Error('Order not found');
    
    orders[index].status = status;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    return orders[index];
  }
}

export const store = new StoreService();