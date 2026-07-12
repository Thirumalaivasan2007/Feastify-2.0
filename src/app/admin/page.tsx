'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { PackageSearch, TrendingUp, Users, DollarSign, CheckCircle, Clock, Edit2, Trash2, Plus, ArrowRight, ArrowLeft, Map, Zap, Truck, ShieldUser, ThermometerSun, AlertTriangle, Play, Pause, BadgeIndianRupee, BellRing, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import AdminKDS from '@/components/AdminKDS';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('orders');
    const [stats, setStats] = useState<any>({ total: 0, cod: 0, online: 0, activeCount: 0, successCount: 0 });
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [foods, setFoods] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const router = useRouter();

    // Modals state
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [editingFood, setEditingFood] = useState<any>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            router.push('/menu');
            return;
        }

        fetchAdminData();
    }, [router]);

    const fetchAdminData = async () => {
        try {
            const [statsRes, ordersRes, usersRes, foodsRes, catsRes] = await Promise.all([
                fetch('/api/revenue-stats'),
                fetch('/api/orders'),
                fetch('/api/users'),
                fetch('/api/foods'),
                fetch('/api/categories')
            ]);
            setStats(await statsRes.json());
            setOrders(await ordersRes.json());
            setUsers(await usersRes.json());
            setFoods(await foodsRes.json());
            setCategories(await catsRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Order Logic ---
    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderStatus: status })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
                toast.success('Status updated successfully');
                fetchAdminData();
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection error');
        }
    };

    const deleteOrder = (orderId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Order',
            message: 'Are you sure you want to permanently delete this order?',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
                    if (res.ok) {
                        setOrders(orders.filter(o => o._id !== orderId));
                        toast.success('Order deleted');
                    }
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to delete order');
                } finally {
                    setConfirmConfig({ ...confirmConfig, isOpen: false });
                }
            }
        });
    };

    const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const role = formData.get('role');

        try {
            toast.loading('Inviting staff member...', { id: 'inviteToast' });
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success('Staff invited successfully!', { id: 'inviteToast' });
                setShowInviteModal(false);
                fetchAdminData(); // Refresh the list
            } else {
                toast.error(data.message || 'Failed to invite staff', { id: 'inviteToast' });
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection error', { id: 'inviteToast' });
        }
    };

    const handleStaffRemoval = async (userId: string, staffName: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Remove Staff Member',
            message: `Are you absolutely sure you want to revoke system access for ${staffName}? They will no longer be able to log in.`,
            onConfirm: async () => {
                try {
                    toast.loading('Removing staff...', { id: 'removeToast' });
                    const res = await fetch(`/api/users?userId=${userId}`, {
                        method: 'DELETE',
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.success(`Staff member removed!`, { id: 'removeToast' });
                        fetchAdminData();
                    } else {
                        toast.error(data.message || 'Failed to remove staff', { id: 'removeToast' });
                    }
                } catch (err) {
                    console.error(err);
                    toast.error('Connection error', { id: 'removeToast' });
                }
                setConfirmConfig({ ...confirmConfig, isOpen: false });
            }
        });
    };

    // --- Food Logic ---
    const handleFoodSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData(e.currentTarget);
        let finalImageUrl = editingFood?.imageUrl || '';

        try {
            // Upload to Cloudinary if there's a new base64 image (starts with data:)
            if (imageBase64 && imageBase64.startsWith('data:')) {
                toast.loading('Uploading image to cloud...', { id: 'uploadToast' });
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imageBase64 })
                });
                const uploadData = await uploadRes.json();
                
                if (!uploadData.success) {
                    toast.error('Image upload failed', { id: 'uploadToast' });
                    return;
                }
                
                finalImageUrl = uploadData.imageUrl;
                toast.success('Image uploaded!', { id: 'uploadToast' });
            }

            const foodData = {
                name: formData.get('name'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price') as string),
                imageUrl: finalImageUrl,
                description: formData.get('description'),
                prepTime: formData.get('prepTime'),
                tag: formData.get('tag')
            };

            const url = editingFood ? `/api/foods/${editingFood._id}` : '/api/foods';
            const method = editingFood ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(foodData)
            });
            
            const data = await res.json();
            if (data.success) {
                setShowFoodModal(false);
                setEditingFood(null);
                setImageBase64(null);
                toast.success(editingFood ? 'Dish updated' : 'Dish added');
                fetchAdminData();
            } else {
                toast.error(data.message || 'Error saving food');
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection error');
        }
    };

    const deleteFood = (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Dish',
            message: 'Are you sure you want to delete this item?',
            onConfirm: async () => {
                try {
                    await fetch(`/api/foods/${id}`, { method: 'DELETE' });
                    toast.success('Item deleted');
                    fetchAdminData();
                } catch (err) { 
                    console.error(err); 
                    toast.error('Failed to delete item');
                } finally {
                    setConfirmConfig({ ...confirmConfig, isOpen: false });
                }
            }
        });
    };

    // --- Category Logic ---
    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newCategoryName) return;
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if(res.ok) {
                setNewCategoryName('');
                fetchAdminData();
            }
        } catch (err) { console.error(err); }
    };

    const deleteCategory = (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Delete Category',
            message: 'Are you sure you want to delete this category?',
            onConfirm: async () => {
                try {
                    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                    toast.success('Category deleted');
                    fetchAdminData();
                } catch (err) { 
                    console.error(err); 
                    toast.error('Failed to delete category');
                } finally {
                    setConfirmConfig({ ...confirmConfig, isOpen: false });
                }
            }
        });
    };

    if (isLoading) return <div className="min-h-screen bg-theme-bg flex items-center justify-center"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>;

    const groupedFoods = categories.map(cat => {
        const items = foods.filter(food => food.category === cat.name);
        return { name: cat.name, items };
    }).filter(cat => cat.items.length > 0);

    const categoryGridItems = selectedCategory 
        ? foods.filter(f => f.category === selectedCategory)
        : [];

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-heading font-extrabold">Admin <span className="text-gradient">Control Panel</span></h1>
                    <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-full border border-white/10 w-fit">
                        {['orders', 'menu', 'users', 'kds', 'heatmap', 'pricing', 'fleet', 'staff', 'campaigns'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === tab ? 'bg-gradient-gold text-[#040A07] shadow-[0_0_20px_rgba(212,184,134,0.3)]' : 'text-theme-text/60 hover:text-theme-gold hover:bg-white/5'}`}
                            >
                                {tab === 'kds' && 'Kitchen'}
                                {tab === 'heatmap' && <><ThermometerSun className="w-3.5 h-3.5"/> Heatmap</>}
                                {tab === 'pricing' && <><BadgeIndianRupee className="w-3.5 h-3.5"/> AI Pricing</>}
                                {tab === 'fleet' && <><Truck className="w-3.5 h-3.5"/> Fleet</>}
                                {tab === 'staff' && <><ShieldUser className="w-3.5 h-3.5"/> Staff</>}
                                {tab === 'campaigns' && <><BellRing className="w-3.5 h-3.5"/> Campaigns</>}
                                {!['kds', 'heatmap', 'pricing', 'fleet', 'staff', 'campaigns'].includes(tab) && tab}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            <div className="glass-panel p-8 rounded-[2rem] border border-theme-border/50 relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-theme-gold/10 rounded-full blur-3xl group-hover:bg-theme-gold/20 transition-all duration-700"></div>
                                <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500"><DollarSign className="w-12 h-12 text-theme-gold" /></div>
                                <h3 className="text-theme-text/60 text-sm font-bold uppercase tracking-widest mb-4">Total Revenue</h3>
                                <div className="text-5xl font-heading font-extrabold text-gradient">₹{stats.total.toFixed(2)}</div>
                            </div>
                            <div className="glass-panel p-8 rounded-[2rem] border border-theme-border/50 relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-theme-gold/10 rounded-full blur-3xl group-hover:bg-theme-gold/20 transition-all duration-700"></div>
                                <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500"><PackageSearch className="w-12 h-12 text-theme-gold" /></div>
                                <h3 className="text-theme-text/60 text-sm font-bold uppercase tracking-widest mb-4">Active Orders</h3>
                                <div className="text-5xl font-heading font-extrabold text-theme-gold">{stats.activeCount}</div>
                            </div>
                            <div className="glass-panel p-8 rounded-[2rem] border border-theme-border/50 relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-700"></div>
                                <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500"><CheckCircle className="w-12 h-12 text-green-500" /></div>
                                <h3 className="text-theme-text/60 text-sm font-bold uppercase tracking-widest mb-4">Completed</h3>
                                <div className="text-5xl font-heading font-extrabold text-green-400">{stats.successCount}</div>
                            </div>
                            <div className="glass-panel p-8 rounded-[2rem] border border-theme-border/50 relative overflow-hidden group">
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                                <div className="absolute top-4 right-4 p-4 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500"><Users className="w-12 h-12 text-blue-500" /></div>
                                <h3 className="text-theme-text/60 text-sm font-bold uppercase tracking-widest mb-4">Online vs COD</h3>
                                <div className="text-xl font-bold text-theme-text/90 mb-1">Online: <span className="text-theme-gold">₹{stats.online.toFixed(2)}</span></div>
                                <div className="text-xl font-bold text-theme-text/90">COD: <span className="text-theme-gold">₹{stats.cod.toFixed(2)}</span></div>
                            </div>
                        </div>

                        {/* Analytics Link */}
                        <div className="flex justify-end mb-8">
                            <Link href="/admin/analytics" className="glass-panel px-6 py-4 rounded-xl border border-theme-border/50 flex items-center gap-4 hover:border-theme-gold/50 hover:bg-white/5 transition-all group">
                                <TrendingUp className="w-6 h-6 text-theme-gold group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <div className="font-bold text-theme-text/90">View Analytics & Charts</div>
                                    <div className="text-xs text-theme-text/50">Detailed revenue breakdown</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-theme-text/40 group-hover:text-theme-gold group-hover:translate-x-1 transition-all ml-2" />
                            </Link>
                        </div>

                        <div className="glass-panel rounded-3xl border border-theme-border/50 overflow-hidden">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-2xl font-bold font-heading">Recent Orders</h2>
                            </div>
                            <div className="overflow-x-auto p-2">
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-theme-text/50 uppercase text-xs tracking-widest font-bold">
                                            <th className="p-4 pl-8">Order ID</th>
                                            <th className="p-4">Customer</th>
                                            <th className="p-4">Items</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Payment</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 pr-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr 
                                                key={order._id} 
                                                className="group hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/admin/order/${order._id}`)}
                                            >
                                                <td className="p-6 font-mono text-sm text-theme-gold border-y border-l border-white/10 group-hover:border-theme-gold/50 rounded-l-2xl">
                                                    {order._id.slice(-8).toUpperCase()}
                                                </td>
                                                <td className="p-6 border-y border-white/10 group-hover:border-theme-gold/50">
                                                    <p className="font-bold text-theme-text">{order.customerDetails.firstName} {order.customerDetails.lastName}</p>
                                                    <p className="text-xs text-theme-text/50 mt-1">{order.customerEmail}</p>
                                                </td>
                                                <td className="p-6 border-y border-white/10 group-hover:border-theme-gold/50 text-sm">
                                                    {order.cartItems.map((item: any, i: number) => (
                                                        <span key={i} className="inline-block bg-white/5 px-2 py-1 rounded-md m-0.5 border border-white/5">{item.quantity}x {item.name}</span>
                                                    ))}
                                                </td>
                                                <td className="p-6 font-bold border-y border-white/10 group-hover:border-theme-gold/50">
                                                    ₹{order.totalAmount.toFixed(2)}
                                                </td>
                                                <td className="p-6 font-bold text-xs uppercase tracking-wider border-y border-white/10 group-hover:border-theme-gold/50">
                                                    <span className="bg-white/10 px-3 py-1.5 rounded-md border border-white/10 text-theme-text/80">{order.paymentMethod}</span>
                                                </td>
                                                <td className="p-6 border-y border-white/10 group-hover:border-theme-gold/50">
                                                    <span className={`status-badge w-fit shadow-inner ${
                                                        order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                        order.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                                                        order.orderStatus === 'Ready' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                        'bg-theme-gold/10 text-theme-gold border-theme-gold/30'
                                                    }`}>
                                                        <span className={`w-2 h-2 rounded-full bg-current ${order.orderStatus === 'Pending' || order.orderStatus === 'Preparing' || order.orderStatus === 'Ready' || order.orderStatus === 'Out for Delivery' ? 'animate-pulse' : ''}`}></span>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td className="p-6 pr-8 text-right flex justify-end items-center gap-4 rounded-r-2xl border-y border-r border-white/10 group-hover:border-theme-gold/50 h-full" onClick={(e) => e.stopPropagation()}>
                                                    <select 
                                                        value={order.orderStatus}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        className="bg-[#040A07]/80 backdrop-blur-md border border-theme-border/50 text-theme-text text-sm font-bold rounded-xl focus:ring-1 focus:ring-theme-gold focus:border-theme-gold px-4 py-2.5 outline-none transition-all cursor-pointer shadow-inner hover:border-theme-gold/50"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Preparing">Preparing</option>
                                                        <option value="Ready">Ready</option>
                                                        <option value="Out for Delivery">Out Delivery</option>
                                                        <option value="Delivered">Delivered</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                    <button onClick={() => deleteOrder(order._id)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-theme-text rounded-xl transition-all duration-300 border border-red-500/20 hover:border-red-500">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && <div className="text-center p-12 text-theme-text/50">No orders found.</div>}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* KDS Tab */}
                {activeTab === 'kds' && (
                    <AdminKDS orders={orders} updateOrderStatus={updateOrderStatus} />
                )}

                {/* Menu Tab */}
                {activeTab === 'menu' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold font-heading">Menu Management</h2>
                            <div className="flex gap-4">
                                <button onClick={() => setShowCategoryModal(true)} className="btn-outline flex items-center gap-2">
                                    Manage Categories
                                </button>
                                <button onClick={() => { setEditingFood(null); setImageBase64(null); setShowFoodModal(true); }} className="btn-primary flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Dish
                                </button>
                            </div>
                        </div>

                        {selectedCategory ? (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="w-full"
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <button 
                                        onClick={() => setSelectedCategory(null)}
                                        className="bg-theme-surface hover:bg-gradient-gold text-theme-text hover:text-[#040A07] p-3 rounded-full transition-all duration-300 border border-theme-border shadow-lg"
                                    >
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                    <div>
                                        <h2 className="text-3xl font-bold font-heading text-theme-text">{selectedCategory}</h2>
                                        <p className="text-theme-text/60 text-sm mt-1">{categoryGridItems.length} items available</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {categoryGridItems.map((food: any, idx: number) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={food._id}
                                            className="glass-card rounded-2xl overflow-hidden group flex flex-col"
                                        >
                                            <div className="relative h-48 overflow-hidden bg-theme-surface">
                                                <div className="absolute inset-0 bg-theme-gold/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                                                <img 
                                                    src={food.imageUrl} 
                                                    alt={food.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-theme-gold/30 text-theme-gold z-20 shadow-lg uppercase tracking-wider">
                                                    {food.tag || selectedCategory}
                                                </div>
                                            </div>
                                            
                                            <div className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-transparent to-[#040A07]/40">
                                                <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-theme-gold transition-colors line-clamp-1">
                                                    {food.name}
                                                </h3>
                                                <p className="text-xs text-theme-text/60 line-clamp-2 mb-4 flex-1 leading-relaxed">{food.description}</p>
                                                
                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className="text-xl font-extrabold text-theme-text/90">
                                                        <span className="text-theme-gold text-base mr-1">₹</span>
                                                        {food.price.toFixed(2)}
                                                    </span>
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => { setEditingFood(food); setImageBase64(food.imageUrl); setShowFoodModal(true); }}
                                                            className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-theme-text p-2.5 rounded-full transition-all duration-300 border border-blue-500/20 hover:border-blue-500"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteFood(food._id)}
                                                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-theme-text p-2.5 rounded-full transition-all duration-300 border border-red-500/20 hover:border-red-500"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col gap-12">
                            {groupedFoods.map((category, catIdx) => (
                                <motion.div 
                                    key={category.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: catIdx * 0.1 }}
                                    className="w-full"
                                >
                                    <div className="flex justify-between items-center mb-6 px-2">
                                        <h2 className="text-2xl md:text-3xl font-bold font-heading text-theme-text/90 tracking-wide">
                                            {category.name}
                                        </h2>
                                        <button 
                                            onClick={() => setSelectedCategory(category.name)}
                                            className="bg-blue-600 hover:bg-blue-500 text-theme-text px-4 py-2 rounded-full shadow-lg transition-colors group flex items-center gap-2 font-bold text-sm"
                                        >
                                            View All
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-2">
                                        {category.items.map((food: any) => (
                                            <div 
                                                key={food._id}
                                                className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] snap-start glass-card rounded-2xl overflow-hidden group flex flex-col flex-shrink-0"
                                            >
                                                <div className="relative h-48 overflow-hidden bg-theme-surface">
                                                    <div className="absolute inset-0 bg-theme-gold/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                                                    <img 
                                                        src={food.imageUrl} 
                                                        alt={food.name} 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-theme-gold/30 text-theme-gold z-20 shadow-lg uppercase tracking-wider">
                                                        {food.tag || category.name}
                                                    </div>
                                                </div>
                                                
                                                <div className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-transparent to-[#040A07]/40">
                                                    <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-theme-gold transition-colors line-clamp-1">
                                                        {food.name}
                                                    </h3>
                                                    <p className="text-xs text-theme-text/60 line-clamp-2 mb-4 flex-1 leading-relaxed">{food.description}</p>
                                                    
                                                    <div className="flex justify-between items-center mt-auto">
                                                        <span className="text-xl font-extrabold text-theme-text/90">
                                                            <span className="text-theme-gold text-base mr-1">₹</span>
                                                            {food.price.toFixed(2)}
                                                        </span>
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => { setEditingFood(food); setImageBase64(food.imageUrl); setShowFoodModal(true); }}
                                                                className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-theme-text p-2.5 rounded-full transition-all duration-300 border border-blue-500/20 hover:border-blue-500"
                                                            >
                                                                <Edit2 className="w-5 h-5" />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteFood(food._id)}
                                                                className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-theme-text p-2.5 rounded-full transition-all duration-300 border border-red-500/20 hover:border-red-500"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                            {groupedFoods.length === 0 && <div className="text-center p-12 text-theme-text/50">No dishes found. Add some!</div>}
                        </div>
                        )}
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 className="text-3xl font-bold font-heading mb-8">Registered Users</h2>
                        <div className="glass-panel rounded-none overflow-hidden">
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-theme-text/50 uppercase text-xs tracking-widest font-bold">
                                            <th className="p-4 pl-8">Name</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4 pr-8">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} className="bg-theme-surface/40 hover:bg-theme-surface-hover transition-all duration-300 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] group">
                                                <td className="p-6 pl-8 font-bold text-theme-text/90 text-lg rounded-l-2xl border-y border-l border-theme-border/30 group-hover:border-theme-gold/30">{u.name}</td>
                                                <td className="p-6 text-theme-text/80 font-medium border-y border-theme-border/30 group-hover:border-theme-gold/30">{u.email}</td>
                                                <td className="p-6 border-y border-theme-border/30 group-hover:border-theme-gold/30">
                                                    <span className={`status-badge w-fit shadow-inner ${u.role === 'admin' ? 'bg-theme-gold/10 text-theme-gold border-theme-gold/30' : 'bg-white/5 text-theme-text/70 border-white/10'}`}>
                                                        {u.role === 'admin' && <span className="w-2 h-2 rounded-full bg-theme-gold animate-pulse"></span>}
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm text-theme-text/60 font-medium rounded-r-2xl border-y border-r border-theme-border/30 group-hover:border-theme-gold/30 pr-8">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                )}

                {/* Heatmap Tab */}
                {activeTab === 'heatmap' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold font-heading mb-2">Demand Heatmap</h2>
                                <p className="text-theme-text/60">AI-Predicted Order Volume by Hour & Region</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border-red-500/30 bg-red-500/10 text-red-400 font-bold text-sm">
                                    <AlertTriangle className="w-4 h-4" /> High Demand Alert: Downtown
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-theme-border/50">
                                <h3 className="font-bold mb-6 flex items-center gap-2"><Map className="w-5 h-5 text-theme-gold" /> Live Activity Map</h3>
                                <div className="w-full h-80 bg-[#040A07] rounded-2xl relative overflow-hidden border border-white/5 flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px', opacity: 0.8 }}>
                                    {/* Mock Heatmap Blurs */}
                                    <div className="absolute top-[30%] left-[40%] w-40 h-40 bg-red-500/40 rounded-full blur-[40px] animate-pulse"></div>
                                    <div className="absolute top-[60%] left-[70%] w-32 h-32 bg-orange-500/30 rounded-full blur-[30px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute top-[20%] left-[20%] w-24 h-24 bg-yellow-500/20 rounded-full blur-[20px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                                    <span className="absolute z-10 text-theme-text/40 font-mono tracking-widest uppercase text-xs font-bold">Simulated Region Map</span>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="glass-panel p-6 rounded-3xl border border-theme-border/50">
                                    <h3 className="font-bold mb-4">Predictive Inventory</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 font-bold">
                                                <span className="text-theme-text">Truffle Oil</span>
                                                <span className="text-red-400">Low (Est. 2 hrs left)</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="w-[15%] h-full bg-red-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1 font-bold">
                                                <span className="text-theme-text">Saffron</span>
                                                <span className="text-yellow-400">Medium</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div className="w-[45%] h-full bg-yellow-500 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-xl text-sm font-bold transition-colors">Auto-Order Stock</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* AI Pricing Tab */}
                {activeTab === 'pricing' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold font-heading mb-2">AI Dynamic Pricing</h2>
                                <p className="text-theme-text/60">Surge logic and margin optimization.</p>
                            </div>
                            <button className="btn-primary flex items-center gap-2"><Zap className="w-4 h-4"/> Enable Global Surge (1.2x)</button>
                        </div>
                        
                        <div className="glass-panel rounded-3xl border border-theme-border/50 overflow-hidden">
                            <table className="w-full text-left border-separate border-spacing-y-4 p-4">
                                <thead>
                                    <tr className="text-theme-text/50 uppercase text-xs tracking-widest font-bold">
                                        <th className="p-4 pl-8">Item</th>
                                        <th className="p-4">Base Price</th>
                                        <th className="p-4">AI Suggested (Surge)</th>
                                        <th className="p-4 text-right pr-8">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white/5 hover:bg-white/10 transition-colors">
                                        <td className="p-4 pl-8 font-bold text-theme-text rounded-l-xl">Truffle Pasta</td>
                                        <td className="p-4 text-theme-text/70">₹450.00</td>
                                        <td className="p-4 text-theme-gold font-bold flex items-center gap-2">₹540.00 <TrendingUp className="w-4 h-4 text-green-500" /></td>
                                        <td className="p-4 text-right pr-8 rounded-r-xl">
                                            <button className="px-4 py-1.5 bg-green-500/20 text-green-400 font-bold text-xs rounded-full border border-green-500/30">Auto-Applied</button>
                                        </td>
                                    </tr>
                                    <tr className="bg-white/5 hover:bg-white/10 transition-colors">
                                        <td className="p-4 pl-8 font-bold text-theme-text rounded-l-xl">Saffron Biryani</td>
                                        <td className="p-4 text-theme-text/70">₹650.00</td>
                                        <td className="p-4 text-theme-gold font-bold">₹700.00</td>
                                        <td className="p-4 text-right pr-8 rounded-r-xl">
                                            <button className="px-4 py-1.5 bg-white/10 text-theme-text/60 hover:text-theme-text font-bold text-xs rounded-full border border-white/20 transition-colors">Apply</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Fleet Management Tab */}
                {activeTab === 'fleet' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold font-heading mb-2">Fleet Management</h2>
                                <p className="text-theme-text/60">Live driver tracking and assignment.</p>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="glass-panel p-6 rounded-3xl border border-theme-border/50">
                                <h3 className="font-bold mb-6">Active Drivers</h3>
                                <div className="space-y-4">
                                    {users.filter((u: any) => u.role === 'driver').length > 0 ? (
                                        users.filter((u: any) => u.role === 'driver').map((driver: any) => (
                                            <div key={driver._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><Truck className="w-5 h-5 text-green-500" /></div>
                                                    <div>
                                                        <p className="font-bold text-theme-text">{driver.name}</p>
                                                        <p className="text-xs text-theme-text/60">Total Deliveries: {driver.totalDeliveries || 0}</p>
                                                    </div>
                                                </div>
                                                <button className="text-theme-gold text-xs font-bold bg-theme-gold/10 px-3 py-1.5 rounded-full border border-theme-gold/30">Track</button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-theme-text/50 p-4 text-center">No active drivers</div>
                                    )}
                                </div>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl border border-theme-border/50 flex flex-col items-center justify-center text-center min-h-[300px]">
                                <Map className="w-16 h-16 text-theme-text/20 mb-4" />
                                <h3 className="font-bold text-xl mb-2 text-theme-text/80">Live Map View</h3>
                                <p className="text-theme-text/50 max-w-xs text-sm">Select a driver from the list to view their exact real-time coordinates.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Staff Tab */}
                {activeTab === 'staff' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold font-heading mb-2">Staff Directory</h2>
                                <p className="text-theme-text/60">Manage roles and permissions.</p>
                            </div>
                            <button onClick={() => setShowInviteModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4"/> Invite Staff</button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.filter((u: any) => u.role === 'admin' || u.role === 'driver').length > 0 ? (
                                users.filter((u: any) => u.role === 'admin' || u.role === 'driver').map((staff: any) => (
                                    <div key={staff._id} className="glass-panel p-6 rounded-3xl border border-theme-border/50">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border ${
                                                staff.role === 'admin' ? 'bg-theme-gold/20 text-theme-gold border-theme-gold/40' : 'bg-blue-500/20 text-blue-500 border-blue-500/40'
                                            }`}>
                                                {staff.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                staff.role === 'admin' ? 'bg-white/10 text-theme-text/70' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                                {staff.role}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-theme-text mb-1">{staff.name}</h3>
                                        <p className="text-xs text-theme-text/50 mb-4">{staff.email}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleStaffRemoval(staff._id, staff.name)} className="flex-1 bg-red-500/10 text-red-500 py-2 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-colors border border-red-500/20">
                                                Revoke Access
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center text-theme-text/50 p-8">No staff found</div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold font-heading mb-2">Push Campaigns</h2>
                                <p className="text-theme-text/60">Send targeted offers to inactive users.</p>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="glass-panel p-8 rounded-3xl border border-theme-border/50">
                                <h3 className="font-bold mb-6 text-xl">Create New Campaign</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-theme-text/50 mb-2 block">Target Audience</label>
                                        <select className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-sm font-bold text-theme-text">
                                            <option>Inactive for 7+ days (1,240 users)</option>
                                            <option>VIP Members (450 users)</option>
                                            <option>All Users (8,902 users)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-theme-text/50 mb-2 block">Message Title</label>
                                        <input type="text" placeholder="e.g., We Miss You! 🍔" className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-sm text-theme-text" />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase font-bold text-theme-text/50 mb-2 block">Message Body</label>
                                        <textarea placeholder="e.g., Use code COMEBACK for 20% off your next order." className="w-full bg-[#111] border border-white/10 rounded-xl p-3 text-sm text-theme-text h-24 resize-none"></textarea>
                                    </div>
                                    <button className="w-full bg-theme-gold text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,184,134,0.4)] transition-all">
                                        <Send className="w-4 h-4" /> Send Push Notification
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="font-bold text-xl">Recent Campaigns</h3>
                                <div className="glass-panel p-6 rounded-3xl border border-theme-border/50 flex flex-col gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-theme-text">Weekend Treat! 🍕</h4>
                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 uppercase font-bold">Sent</span>
                                        </div>
                                        <p className="text-sm text-theme-text/60 mb-3">Get a free dessert with orders over ₹1000.</p>
                                        <div className="flex justify-between text-xs font-bold text-theme-text/40">
                                            <span>Target: All Users</span>
                                            <span>Converted: 14%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modals */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-panel p-8 rounded-3xl w-full max-w-md">
                        <h3 className="text-2xl font-heading font-bold mb-6">Manage Categories</h3>
                        <form onSubmit={handleCategorySubmit} className="flex gap-2 mb-8">
                            <input 
                                type="text" 
                                value={newCategoryName} 
                                onChange={e => setNewCategoryName(e.target.value)} 
                                placeholder="New category name..."
                                className="input-field flex-1"
                                required
                            />
                            <button type="submit" className="btn-primary px-6">Add</button>
                        </form>
                        <div className="space-y-2">
                            {categories.map(c => (
                                <div key={c._id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                                    <span className="font-bold">{c.name}</span>
                                    <button onClick={() => deleteCategory(c._id)} className="text-red-400 p-2 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowCategoryModal(false)} className="mt-8 w-full btn-outline">Close</button>
                    </motion.div>
                </div>
            )}

            {showFoodModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="glass-panel p-8 rounded-3xl w-full max-w-2xl my-8">
                        <h3 className="text-2xl font-heading font-bold mb-6">{editingFood ? 'Edit Dish' : 'Add New Dish'}</h3>
                        <form onSubmit={handleFoodSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-theme-text/50 uppercase mb-2">Dish Name</label>
                                    <input type="text" name="name" defaultValue={editingFood?.name} className="input-field w-full" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-theme-text/50 uppercase mb-2">Category</label>
                                    <select name="category" defaultValue={editingFood?.category} className="input-field w-full bg-[#111]" required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-theme-text/50 uppercase mb-2">Upload Image</label>
                                <div className="flex items-center gap-4">
                                    {imageBase64 && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/20 shrink-0">
                                            <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload} 
                                        className="input-field w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-theme-gold file:text-black hover:file:bg-theme-gold/90" 
                                        required={!editingFood && !imageBase64}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-theme-text/50 uppercase mb-2">Price (₹)</label>
                                    <input type="number" step="0.01" name="price" defaultValue={editingFood?.price} className="input-field w-full" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-theme-text/50 uppercase mb-2">Prep Time</label>
                                    <input type="text" name="prepTime" defaultValue={editingFood?.prepTime || '25-30 Mins'} className="input-field w-full" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-theme-text/50 uppercase mb-2">Tag/Badge</label>
                                    <input type="text" name="tag" defaultValue={editingFood?.tag || 'Fresh Items'} className="input-field w-full" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-theme-text/50 uppercase mb-2">Description</label>
                                <textarea name="description" defaultValue={editingFood?.description} className="input-field w-full h-24 resize-none" required></textarea>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowFoodModal(false)} className="btn-outline flex-1">Cancel</button>
                                <button type="submit" className="btn-primary flex-1">{editingFood ? 'Save Changes' : 'Add Dish'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Invite Staff Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-theme-surface border border-theme-border/50 p-8 rounded-[2rem] w-full max-w-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-theme-gold/10 rounded-full blur-3xl pointer-events-none" />
                        <h2 className="text-2xl font-bold mb-6 font-heading">Invite New Staff</h2>
                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-theme-text/70 mb-1 ml-2">Full Name</label>
                                <input type="text" name="name" className="input-field w-full" required placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm text-theme-text/70 mb-1 ml-2">Email Address</label>
                                <input type="email" name="email" className="input-field w-full" required placeholder="john@feastify.com" />
                            </div>
                            <div>
                                <label className="block text-sm text-theme-text/70 mb-1 ml-2">Temporary Password</label>
                                <input type="password" name="password" className="input-field w-full" required placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm text-theme-text/70 mb-1 ml-2">Role</label>
                                <select name="role" className="input-field w-full" required>
                                    <option value="driver">Delivery Driver</option>
                                    <option value="admin">System Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-outline flex-1">Cancel</button>
                                <button type="submit" className="btn-primary flex-1">Send Invite</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
            />
        </main>
    );
}
