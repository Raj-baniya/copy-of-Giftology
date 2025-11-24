import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icons } from '../components/ui/Icons';
import { store } from '../services/store';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types';

export const ProductDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await store.getProductBySlug(slug);
                if (data) {
                    setProduct(data);
                    setSelectedImage(data.imageUrl);
                } else {
                    navigate('/shop');
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug, navigate]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.name,
                    text: product?.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            alert('Link copied to clipboard!');
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) return null;

    const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
    const discountPercentage = product.marketPrice && product.marketPrice > product.price
        ? Math.round(((product.marketPrice - product.price) / product.marketPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb / Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-black mb-8 transition-colors font-medium"
                >
                    <Icons.ChevronLeft className="w-5 h-5 mr-1" />
                    Back to Shop
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Image Gallery */}
                        <div className="p-8 md:p-12 bg-gray-50 flex flex-col items-center justify-center relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full aspect-square relative z-10"
                            >
                                <img
                                    src={selectedImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                />
                                {discountPercentage > 0 && (
                                    <div className="absolute top-0 left-0 bg-black text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                        -{discountPercentage}% OFF
                                    </div>
                                )}
                            </motion.div>

                            {images.length > 1 && (
                                <div className="flex gap-4 mt-8 overflow-x-auto pb-2 scrollbar-hide w-full justify-center">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(img)}
                                            className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-black shadow-lg scale-110' : 'border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="p-8 md:p-12 flex flex-col bg-white">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col h-full"
                            >
                                <div className="mb-2">
                                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {product.category.replace('-', ' ')}
                                    </span>
                                </div>
                                <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{product.name}</h1>

                                <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-gray-100">
                                    <span className="text-4xl font-bold text-black" style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;{product.price.toLocaleString()}</span>
                                    {product.marketPrice && product.marketPrice > product.price && (
                                        <span className="text-xl text-gray-400 line-through" style={{ fontFamily: 'Arial, sans-serif' }}>&#8377;{product.marketPrice.toLocaleString()}</span>
                                    )}
                                </div>

                                <div className="prose prose-lg text-gray-600 mb-8 max-w-none leading-relaxed">
                                    <p>{product.description}</p>
                                </div>

                                <div className="mt-auto space-y-6">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="flex-1 bg-gradient-to-r from-rose-400 to-rose-600 text-white py-4 px-8 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-rose-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                                        >
                                            <Icons.ShoppingCart className="w-6 h-6" />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="w-14 h-14 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-all"
                                            title="Share Product"
                                        >
                                            <Icons.ArrowRight className="w-6 h-6 -rotate-45" />
                                        </button>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-2 gap-4 pt-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="p-2 bg-white rounded-full text-green-600 shadow-sm">
                                                <Icons.Check className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm text-gray-700">In Stock</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm">
                                                <Icons.Truck className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm text-gray-700">Fast Delivery</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="p-2 bg-white rounded-full text-purple-600 shadow-sm">
                                                <Icons.Shield className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm text-gray-700">Secure Payment</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="p-2 bg-white rounded-full text-orange-600 shadow-sm">
                                                <Icons.Gift className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-sm text-gray-700">Gift Ready</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
