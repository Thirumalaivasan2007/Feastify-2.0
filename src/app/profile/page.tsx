'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, MapPin, CreditCard, Bell, Settings, Edit3, Camera, LogOut, Package, ExternalLink, Clock, Truck, CheckCircle2, Phone, Gift, Trophy, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [activeTab, setActiveTab] = useState<'settings' | 'orders'>('settings');
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/');
            return;
        }
        const u = JSON.parse(userStr);
        if (u.role === 'admin') {
            router.push('/admin');
            return;
        }
        // Fetch fresh user data
        fetch(`/api/users/${u.userId || u._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify({ ...u, ...data.user }));
                } else {
                    setUser(u);
                }
            })
            .catch(() => setUser(u));
        
        // Fetch Orders
        setIsLoadingOrders(true);
        fetch(`/api/orders?email=${encodeURIComponent(u.email)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                }
                setIsLoadingOrders(false);
            })
            .catch(err => {
                console.error("Failed to fetch orders", err);
                setIsLoadingOrders(false);
            });
    }, [router]);

    const handleFeatureMock = () => {
        toast('This premium feature will be available soon!', {
            icon: '✨',
            style: {
                background: 'rgba(4, 10, 7, 0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(212, 184, 134, 0.15)',
                color: '#d4b886',
            },
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/');
    };

    return (
        <main className="min-h-screen bg-transparent text-theme-text pt-24 pb-12 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-theme-gold/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-theme-gold/5 blur-[120px] pointer-events-none" />
            
            <Navbar />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <h1 className="text-4xl font-heading md:text-5xl font-heading font-light mb-10">Account <span className="text-gradient">Settings</span></h1>
                
                {user && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1"
                        >
                            <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-theme-gold/5 to-transparent pointer-events-none" />
                                
                                <div className="relative mb-6 mt-4 group cursor-pointer" onClick={handleFeatureMock}>
                                    <div className="w-32 h-32 rounded-full bg-theme-surface flex items-center justify-center text-5xl font-bold font-heading text-theme-gold border-[3px] border-theme-gold/20 shadow-[0_0_30px_rgba(212,184,134,0.15)] group-hover:border-theme-gold transition-colors duration-500 overflow-hidden relative z-10">
                                        {user.name.charAt(0).toUpperCase()}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-sm">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-theme-gold/20 rounded-full blur-[30px] -z-10 group-hover:bg-theme-gold/40 transition-colors duration-500"></div>
                                </div>
                                
                                <h2 className="text-2xl font-heading font-light mb-2 text-white/90">{user.name}</h2>
                                <p className="text-theme-text/50 font-medium text-sm flex items-center gap-2 mb-6 justify-center">
                                    <Mail className="w-4 h-4" /> {user.email}
                                </p>
                                
                                <div className="w-full h-[1px] bg-theme-border/50 mb-6"></div>
                                
                                <div className="w-full flex justify-between items-center px-2 text-sm font-bold">
                                    <span className="text-theme-text/60">Status</span>
                                    <span className="text-theme-gold flex items-center gap-1.5 bg-theme-gold/10 px-3 py-1 rounded-full border border-theme-gold/20">
                                        <ShieldCheck className="w-4 h-4" /> Verified
                                    </span>
                                </div>

                                <div className="w-full mt-10 space-y-3">
                                    <button 
                                        onClick={() => setActiveTab('settings')} 
                                        className={`w-full py-3 px-4 rounded-none font-bold transition-all duration-300 flex items-center gap-3 ${activeTab === 'settings' ? 'bg-theme-surface text-theme-gold border border-theme-gold/30' : 'bg-transparent text-white/50 hover:bg-theme-surface/50 border border-transparent'}`}
                                    >
                                        <Settings className="w-5 h-5" /> Account Settings
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('orders')} 
                                        className={`w-full py-3 px-4 rounded-none font-bold transition-all duration-300 flex items-center gap-3 ${activeTab === 'orders' ? 'bg-theme-surface text-theme-gold border border-theme-gold/30' : 'bg-transparent text-white/50 hover:bg-theme-surface/50 border border-transparent'}`}
                                    >
                                        <Package className="w-5 h-5" /> Order History
                                        {orders.length > 0 && (
                                            <span className="ml-auto bg-theme-gold/20 text-theme-gold text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
                                        )}
                                    </button>
                                </div>
                                
                                <div className="w-full mt-6">
                                    <button 
                                        onClick={handleLogout} 
                                        className="w-full py-4 rounded-none border border-red-500/20 bg-red-500/10 text-red-400 font-bold hover:bg-red-500 hover:text-[#040A07] transition-all duration-300 flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                                    >
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </div>

                            {/* Feastify VIP Card */}
                            <div className="mt-8 relative group perspective-1000">
                                <motion.div 
                                    className="relative w-full aspect-[1.586/1] rounded-none overflow-hidden shadow-2xl transition-transform duration-500 transform-gpu group-hover:rotate-x-12 group-hover:rotate-y-12"
                                    style={{
                                        background: user.loyaltyTier === 'Black' ? 'linear-gradient(135deg, #111, #000)' :
                                                    user.loyaltyTier === 'Platinum' ? 'linear-gradient(135deg, #e5e4e2, #b0b0b0)' :
                                                    'linear-gradient(135deg, #d4b886, #8a7346)',
                                        color: user.loyaltyTier === 'Platinum' ? '#000' : '#fff'
                                    }}
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                                    
                                    <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-heading font-light text-2xl tracking-wider">FEASTIFY</div>
                                                <div className="text-xs font-bold uppercase tracking-widest opacity-70">{user.loyaltyTier || 'Gold'} VIP</div>
                                            </div>
                                            <div className="w-12 h-8 rounded bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center">
                                                <div className="w-6 h-4 border border-white/50 rounded-sm"></div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-xs font-mono uppercase tracking-widest opacity-70 mb-1">Feast Points</div>
                                            <div className="font-heading font-light text-4xl">{user.feastPoints || 0}</div>
                                            <div className="text-sm font-medium opacity-80 mt-2">{user.name?.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Shimmer effect */}
                                    <div className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer"></div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Main Content Area */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2 space-y-6"
                        >
                            {activeTab === 'settings' ? (
                                <>
                                    {/* Personal Info */}
                                    <div className="glass-panel p-8 rounded-[2.5rem]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-3">
                                                <User className="w-5 h-5 text-theme-gold" /> Personal Information
                                            </h3>
                                            <button onClick={handleFeatureMock} className="text-theme-text/50 hover:text-theme-gold transition-colors p-2 hover:bg-theme-gold/10 rounded-full">
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-theme-surface p-4 rounded-none border border-theme-border/30">
                                                <div className="text-xs font-bold text-theme-text/40 uppercase tracking-wider mb-1">Full Name</div>
                                                <div className="text-white font-medium">{user.name}</div>
                                            </div>
                                            <div className="bg-theme-surface p-4 rounded-none border border-theme-border/30">
                                                <div className="text-xs font-bold text-theme-text/40 uppercase tracking-wider mb-1">Email Address</div>
                                                <div className="text-white font-medium">{user.email}</div>
                                            </div>
                                            <div className="bg-theme-surface p-4 rounded-none border border-theme-border/30">
                                                <div className="text-xs font-bold text-theme-text/40 uppercase tracking-wider mb-1">Phone Number</div>
                                                <div className="text-white/50 font-medium italic">Not provided</div>
                                            </div>
                                            <div className="bg-theme-surface p-4 rounded-none border border-theme-border/30">
                                                <div className="text-xs font-bold text-theme-text/40 uppercase tracking-wider mb-1">Member Since</div>
                                                <div className="text-white font-medium">{new Date().getFullYear()}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Settings Mockups */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div 
                                            onClick={handleFeatureMock}
                                            className="glass-card p-6 rounded-none border border-theme-border/30 hover:border-theme-gold/30 hover:bg-theme-gold/5 transition-all duration-300 cursor-pointer flex items-center gap-4 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <MapPin className="w-5 h-5 text-theme-gold" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">Saved Addresses</h4>
                                                <p className="text-xs text-theme-text/50 font-medium">Manage delivery locations</p>
                                            </div>
                                        </div>

                                        <div 
                                            onClick={handleFeatureMock}
                                            className="glass-card p-6 rounded-none border border-theme-border/30 hover:border-theme-gold/30 hover:bg-theme-gold/5 transition-all duration-300 cursor-pointer flex items-center gap-4 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <CreditCard className="w-5 h-5 text-theme-gold" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">Payment Methods</h4>
                                                <p className="text-xs text-theme-text/50 font-medium">Cards & Wallets</p>
                                            </div>
                                        </div>

                                        <div 
                                            onClick={handleFeatureMock}
                                            className="glass-card p-6 rounded-none border border-theme-border/30 hover:border-theme-gold/30 hover:bg-theme-gold/5 transition-all duration-300 cursor-pointer flex items-center gap-4 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Bell className="w-5 h-5 text-theme-gold" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">Notifications</h4>
                                                <p className="text-xs text-theme-text/50 font-medium">Manage preferences</p>
                                            </div>
                                        </div>

                                        <div 
                                            onClick={handleFeatureMock}
                                            className="glass-card p-6 rounded-none border border-theme-border/30 hover:border-theme-gold/30 hover:bg-theme-gold/5 transition-all duration-300 cursor-pointer flex items-center gap-4 group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Settings className="w-5 h-5 text-theme-gold" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold mb-1">Account Settings</h4>
                                                <p className="text-xs text-theme-text/50 font-medium">Security & Privacy</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="glass-panel p-8 rounded-[2.5rem] min-h-[500px]">
                                    <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                                        <Package className="w-6 h-6 text-theme-gold" /> Your Orders
                                    </h3>
                                    
                                    {isLoadingOrders ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-20">
                                            <Package className="w-16 h-16 mx-auto mb-4 text-white/10" />
                                            <h4 className="text-xl font-bold text-white/50 mb-4">No orders yet</h4>
                                            <button onClick={() => router.push('/menu')} className="btn-outline">Explore Menu</button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {orders.map((order: any) => {
                                                const subtotal = order.cartItems?.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0) || 0;
                                                const tax = subtotal * 0.05;
                                                const delivery = subtotal > 0 ? 40 : 0;

                                                return (
                                                    <div key={order._id} className="glass-panel relative overflow-hidden rounded-none border border-theme-border/50 transition-all hover:border-theme-gold/30 hover:shadow-[0_0_40px_rgba(212,184,134,0.1)] group">
                                                        {/* Status Badge & Header */}
                                                        <div className="p-6 md:p-8 border-b border-theme-border/30 bg-black/20 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <span className="text-xl font-heading font-bold text-white tracking-wide">Receipt</span>
                                                                    <span className="text-theme-gold/70 text-sm font-mono bg-theme-gold/10 px-2 py-0.5 rounded">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                                                </div>
                                                                <div className="text-sm text-theme-text/60 flex items-center gap-2">
                                                                    <Clock className="w-4 h-4" /> 
                                                                    {new Date(order.createdAt || order.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(order.createdAt || order.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border backdrop-blur-md ${
                                                                    order.orderStatus === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                                                                    order.orderStatus === 'Delivered' ? 'bg-theme-gold/10 text-theme-gold border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' :
                                                                    order.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]' :
                                                                    'bg-blue-500/10 text-blue-500 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                                }`}>
                                                                    {order.orderStatus}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Inline Tracking Bar for Active Orders */}
                                                        {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                                                            <div className="px-6 md:px-8 py-8 border-b border-theme-border/30 bg-theme-gold/5">
                                                                <div className="text-xs font-bold uppercase tracking-widest text-theme-gold mb-6 flex items-center gap-2">
                                                                    <Truck className="w-4 h-4" /> Live Tracking
                                                                </div>
                                                                <div className="relative max-w-3xl mx-auto">
                                                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-theme-border/30 -translate-y-1/2 z-0 rounded-full"></div>
                                                                    <div 
                                                                        className="absolute top-1/2 left-0 h-1 bg-theme-gold -translate-y-1/2 z-0 transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(212,184,134,0.5)]"
                                                                        style={{ 
                                                                            width: order.orderStatus === 'Pending' ? '0%' : 
                                                                                   order.orderStatus === 'Preparing' ? '33%' : 
                                                                                   order.orderStatus === 'Out for Delivery' ? '66%' : '100%' 
                                                                        }}
                                                                    ></div>
                                                                    <div className="flex justify-between relative z-10">
                                                                        {['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].map((step, i) => {
                                                                            const stepIndex = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'].indexOf(order.orderStatus);
                                                                            const isActive = i <= stepIndex;
                                                                            const isCurrent = i === stepIndex;
                                                                            return (
                                                                                <div key={step} className="flex flex-col items-center gap-3">
                                                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 bg-[#040A07] ${
                                                                                        isActive ? 'border-theme-gold text-theme-gold shadow-[0_0_15px_rgba(212,184,134,0.4)]' : 'border-theme-border/50 text-white/30'
                                                                                    } ${isCurrent ? 'scale-110 bg-theme-gold/10' : ''}`}>
                                                                                        {isActive ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-white/20"></div>}
                                                                                    </div>
                                                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-theme-gold' : 'text-white/30'} hidden sm:block`}>
                                                                                        {step === 'Pending' ? 'Order Placed' : step === 'Out for Delivery' ? 'On The Way' : step}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Details Grid */}
                                                        <div className="p-6 md:p-8 grid md:grid-cols-5 gap-8">
                                                            
                                                            {/* Column 1: Customer Details */}
                                                            <div className="md:col-span-2 space-y-6">
                                                                <div>
                                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-theme-text/40 mb-3 border-b border-theme-border/30 pb-2">Delivery Details</h4>
                                                                    <div className="space-y-1">
                                                                        <div className="font-bold text-white text-lg">{order.customerDetails?.name || user?.name || 'Customer'}</div>
                                                                        <div className="text-theme-text/70 text-sm flex items-center gap-2 mt-1">
                                                                            <Phone className="w-3.5 h-3.5 opacity-50" /> {order.customerDetails?.phone || 'Not provided'}
                                                                        </div>
                                                                        <div className="text-theme-text/70 text-sm mt-2 leading-relaxed">
                                                                            {order.customerDetails?.address || 'Address not provided'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div>
                                                                    <h4 className="text-xs font-bold uppercase tracking-widest text-theme-text/40 mb-3 border-b border-theme-border/30 pb-2">Payment Method</h4>
                                                                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-none text-sm font-medium text-white">
                                                                        <CreditCard className="w-4 h-4 text-theme-gold" />
                                                                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Column 2: Order Items & Total */}
                                                            <div className="md:col-span-3 bg-black/20 p-6 rounded-none border border-white/5">
                                                                <h4 className="text-xs font-bold uppercase tracking-widest text-theme-text/40 mb-4 border-b border-theme-border/30 pb-2">Order Summary</h4>
                                                                
                                                                <div className="space-y-4 mb-6">
                                                                    {order.cartItems?.map((item: any, idx: number) => (
                                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="font-mono text-theme-gold bg-theme-gold/10 px-2 py-0.5 rounded font-bold">{item.quantity}x</span>
                                                                                <span className="text-white/90">{item.name}</span>
                                                                            </div>
                                                                            <div className="text-white/70 font-mono">₹{(item.price * (item.quantity || 1)).toFixed(2)}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className="border-t border-dashed border-theme-border/50 pt-4 space-y-2 text-sm">
                                                                    <div className="flex justify-between text-white/50">
                                                                        <span>Subtotal</span>
                                                                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-white/50">
                                                                        <span>Taxes (5%)</span>
                                                                        <span className="font-mono">₹{tax.toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-white/50">
                                                                        <span>Delivery</span>
                                                                        <span className="font-mono">₹{delivery.toFixed(2)}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="border-t border-theme-border/50 mt-4 pt-4 flex justify-between items-center">
                                                                    <span className="font-bold text-white uppercase tracking-wider text-sm">Total Paid</span>
                                                                    <span className="text-3xl font-heading font-light text-gradient">₹{order.totalAmount?.toFixed(2)}</span>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </main>
    );
}
