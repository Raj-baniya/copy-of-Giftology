import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { store } from '../services/store';
import { getContactMessages } from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';
import { Product, Order } from '../types';
import { Icons } from '../components/ui/Icons';
import { useForm } from 'react-hook-form';
import { CATEGORIES } from '../services/mockData';

export const Admin = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'leads'>('inventory');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Product, 'id'>>();

    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setError(null);
            const productData = await store.getProducts();
            setProducts(productData);

            const orderData = await store.getOrders();
            // Sort orders by newest first
            setOrders(orderData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            const leadsData = await getContactMessages();
            setLeads(leadsData || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
            setError('Failed to load data. Please check your connection and try again.');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                    <Icons.X className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={loadData}
                        className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        const checkAdminAuth = async () => {
            // 1. Check Supabase Session
            const { data: { session } } = await supabase.auth.getSession();

            // 2. Check LocalStorage Fallback
            const isFallbackAuth = localStorage.getItem('giftology_admin_auth') === 'true';

            if (session || isFallbackAuth) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            setIsLoadingAuth(false);
        };
        checkAdminAuth();
    }, []);

    if (isLoadingAuth) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // Allow if: 1. Local/Supabase Admin (isAdmin) OR 2. Clerk Admin (user.role === 'admin')
    if (!isAdmin && (!user || user.role !== 'admin')) {
        return <Navigate to="/admin-login" />;
    }

    const onSubmit = async (data: any) => {
        const productData = {
            ...data,
            price: Number(data.price),
            trending: Boolean(data.trending)
        };

        if (editingId) {
            await store.updateProduct(editingId, productData);
        } else {
            await store.addProduct(productData);
        }
        await loadData();
        closeModal();
    };

    const deleteProduct = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await store.deleteProduct(id);
            await loadData();
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        await store.updateOrderStatus(orderId, newStatus);
        await loadData();
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingId(product.id);
            setValue('name', product.name);
            setValue('price', product.price);
            setValue('category', product.category);
            setValue('imageUrl', product.imageUrl);
            setValue('description', product.description);
            setValue('trending', product.trending || false);
        } else {
            setEditingId(null);
            reset();
            setValue('trending', false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-serif font-bold">Admin Dashboard</h1>
                        <p className="text-textMuted text-sm md:text-base">Manage products and view orders</p>
                    </div>
                    {activeTab === 'inventory' && (
                        <button
                            onClick={() => openModal()}
                            className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 shadow-lg transition-transform active:scale-95"
                        >
                            <Icons.Plus className="w-5 h-5" /> Add Product
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`pb-3 px-2 text-sm md:text-base font-bold transition-colors ${activeTab === 'inventory' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Product Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-3 px-2 text-sm md:text-base font-bold transition-colors ${activeTab === 'orders' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Order Management
                    </button>
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`pb-3 px-2 text-sm md:text-base font-bold transition-colors ${activeTab === 'leads' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Leads & Messages
                    </button>
                </div>

                {activeTab === 'inventory' ? (
                    /* --- INVENTORY TAB --- */
                    <>
                        {/* Desktop Table View (Hidden on Mobile) */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Image</th>
                                        <th className="p-4 font-semibold text-gray-600">Name</th>
                                        <th className="p-4 font-semibold text-gray-600">Category</th>
                                        <th className="p-4 font-semibold text-gray-600">Price</th>
                                        <th className="p-4 font-semibold text-gray-600">Status</th>
                                        <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {products.map(product => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover bg-gray-200" />
                                            </td>
                                            <td className="p-4 font-medium">{product.name}</td>
                                            <td className="p-4">
                                                <span className="bg-primary/20 text-primary-dark px-2 py-1 rounded text-xs font-bold uppercase">
                                                    {product.category.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4">₹{product.price.toLocaleString()}</td>
                                            <td className="p-4">
                                                {product.trending && (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                                                        <Icons.TrendingUp className="w-3 h-3" /> Trending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => openModal(product)} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                                                    <Icons.Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                                                    <Icons.Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View (Inventory) */}
                        <div className="md:hidden space-y-4">
                            {products.map(product => (
                                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex gap-4 mb-3">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-20 h-20 rounded-lg object-cover bg-gray-100 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900 line-clamp-2 mb-1 pr-2">{product.name}</h3>
                                                {product.trending && (
                                                    <Icons.TrendingUp className="w-4 h-4 text-orange-500 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">{product.category.replace('-', ' ')}</p>
                                            <p className="font-bold text-lg text-gray-900">₹{product.price.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-3 border-t border-gray-50">
                                        <button
                                            onClick={() => openModal(product)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2.5 rounded-lg font-bold text-sm active:bg-blue-100 transition-colors"
                                        >
                                            <Icons.Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2.5 rounded-lg font-bold text-sm active:bg-red-100 transition-colors"
                                        >
                                            <Icons.Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : activeTab === 'orders' ? (
                    /* --- ORDERS TAB --- */
                    <>
                        {orders.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                                <Icons.Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-textMain">No orders found</h2>
                                <p className="text-textMuted">Orders placed by customers will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Desktop Orders Table */}
                                <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                                <th className="p-4 font-semibold text-gray-600">Date</th>
                                                <th className="p-4 font-semibold text-gray-600">Items Summary</th>
                                                <th className="p-4 font-semibold text-gray-600">Total</th>
                                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {orders.map(order => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="p-4 font-mono text-sm">{order.id}</td>
                                                    <td className="p-4 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                                                    <td className="p-4 max-w-xs">
                                                        <p className="text-sm truncate">
                                                            {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                                        </p>
                                                    </td>
                                                    <td className="p-4 font-bold">₹{order.total.toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                            className={`border-none text-sm font-bold rounded-lg px-3 py-1.5 cursor-pointer outline-none
                                                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-yellow-100 text-yellow-800'}`}
                                                        >
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Orders List */}
                                <div className="md:hidden space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                                                    <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className="font-bold text-lg">₹{order.total.toLocaleString()}</span>
                                            </div>

                                            <div className="border-t border-b border-gray-50 py-3 my-3 space-y-1">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span className="text-gray-600 truncate pr-4">{item.name}</span>
                                                        <span className="font-medium text-gray-900">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between gap-4 mt-2">
                                                <span className="text-sm font-bold text-gray-600">Status:</span>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                                    className={`flex-1 text-right appearance-none font-bold text-sm bg-transparent outline-none cursor-pointer
                                                ${order.status === 'Delivered' ? 'text-green-600' :
                                                            order.status === 'Shipped' ? 'text-blue-600' :
                                                                'text-yellow-600'}`}
                                                >
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                </select>
                                                <Icons.ChevronDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* --- LEADS TAB --- */
                    <>
                        {leads.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                                <Icons.Mail className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h2 className="text-xl font-bold text-textMain">No leads found</h2>
                                <p className="text-textMuted">Contact form submissions will appear here.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 font-semibold text-gray-600">Date</th>
                                            <th className="p-4 font-semibold text-gray-600">Name</th>
                                            <th className="p-4 font-semibold text-gray-600">Contact</th>
                                            <th className="p-4 font-semibold text-gray-600">Source</th>
                                            <th className="p-4 font-semibold text-gray-600">Message</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {leads.map((lead) => (
                                            <tr key={lead.id} className="hover:bg-gray-50">
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                    <div className="text-xs">{new Date(lead.created_at).toLocaleTimeString()}</div>
                                                </td>
                                                <td className="p-4 font-medium">{lead.name}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        {lead.phone && (
                                                            <span className="flex items-center gap-2 text-sm">
                                                                <Icons.Phone className="w-3 h-3 text-gray-400" />
                                                                {lead.phone}
                                                            </span>
                                                        )}
                                                        {lead.email && (
                                                            <span className="flex items-center gap-2 text-sm text-blue-600">
                                                                <Icons.Mail className="w-3 h-3" />
                                                                <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${lead.source === 'mobile_modal' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {lead.source === 'mobile_modal' ? 'Popup' : lead.source || 'Web'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                                                    {lead.message}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'New Product'}</h2>
                            <button onClick={closeModal}><Icons.X /></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Product Name</label>
                                <input
                                    {...register('name', { required: 'Name is required' })}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900"
                                />
                                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        {...register('price', { required: 'Price is required', min: 0 })}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900"
                                    />
                                    {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Category</label>
                                    <select {...register('category', { required: true })} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900">
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Image URL</label>
                                <input
                                    {...register('imageUrl', { required: 'Image URL is required' })}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900"
                                    placeholder="https://..."
                                />
                                {errors.imageUrl && <span className="text-red-500 text-xs">{errors.imageUrl.message}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    {...register('description', { required: 'Description is required' })}
                                    className="w-full border rounded-lg p-2 h-24 focus:ring-2 focus:ring-primary outline-none bg-white text-gray-900"
                                    placeholder="Enter product details..."
                                ></textarea>
                                {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
                            </div>

                            {/* Trending Checkbox */}
                            <div className="flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="trending"
                                    {...register('trending')}
                                    className="w-5 h-5 accent-primary cursor-pointer"
                                />
                                <label htmlFor="trending" className="text-sm font-bold cursor-pointer flex items-center gap-2">
                                    <Icons.TrendingUp className="w-4 h-4 text-orange-500" />
                                    Mark as Trending
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800">Save Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};