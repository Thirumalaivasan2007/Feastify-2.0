'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, XCircle, Search, Calendar, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/ConfirmModal';
import ReviewModal from '@/components/ReviewModal';
import LiveTrackingMap from '@/components/LiveTrackingMap';

export default function OrdersPage() {
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [reviewConfig, setReviewConfig] = useState({ isOpen: false, foodId: '', foodName: '' });
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
        setUser(u);

        fetch(`/api/my-orders?email=${u.email}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data);
                } else if (data && Array.isArray(data.orders)) {
                    setOrders(data.orders);
                } else {
                    console.error("Failed to fetch orders:", data);
                    setOrders([]);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [router]);

    useEffect(() => {
        // Only bind if pusher is available and we have orders
        if (!orders.length) return;
        import('@/lib/pusher').then(({ pusherClient }) => {
            if (!pusherClient) return;
            
            orders.forEach(order => {
                const channelName = `order-${order._id}`;
                const channel = pusherClient.subscribe(channelName);
                channel.bind('status-update', (data: any) => {
                    setOrders(prev => prev.map(o => o._id === data.orderId ? { ...o, orderStatus: data.status } : o));
                    if (data.status === 'Delivered') {
                        toast.success(`Order ${data.orderId.slice(-4)} has been delivered!`);
                    } else if (data.status === 'Out for Delivery') {
                        toast.success(`Order ${data.orderId.slice(-4)} is out for delivery!`);
                    }
                });
            });
            
            return () => {
                orders.forEach(order => {
                    pusherClient.unsubscribe(`order-${order._id}`);
                });
            };
        });
    }, [orders.length]);

    const getStatusDetails = (status: string) => {
        if (status === 'Delivered') return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', progress: 100 };
        if (status === 'Cancelled') return { icon: <XCircle className="w-5 h-5 text-red-500" />, bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', progress: 100 };
        if (status === 'Out for Delivery') return { icon: <Package className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', progress: 75 };
        if (status === 'Ready') return { icon: <Package className="w-5 h-5 text-green-400" />, bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', progress: 60 };
        if (status === 'Preparing') return { icon: <Search className="w-5 h-5 text-orange-400" />, bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', progress: 50 };
        return { icon: <Clock className="w-5 h-5 text-theme-gold" />, bg: 'bg-theme-gold/10', border: 'border-theme-gold/20', text: 'text-theme-gold', progress: 25 };
    };

    const cancelOrder = (orderId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    const res = await fetch(`/api/orders/${orderId}/customer-cancel`, {
                        method: 'POST'
                    });
                    const data = await res.json();
                    if (data.success) {
                        setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o));
                        toast.success('Order cancelled successfully');
                    } else {
                        toast.error('Failed to cancel order');
                    }
                } catch (err) {
                    console.error(err);
                    toast.error('Connection error');
                } finally {
                    setConfirmConfig({ ...confirmConfig, isOpen: false });
                }
            }
        });
    };

    return (
        <main className="min-h-screen bg-transparent text-theme-text pt-24 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-theme-gold/5 blur-[120px] pointer-events-none" />
            
            <Navbar />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-4xl md:text-5xl font-heading font-extrabold">My <span className="text-gradient">Orders</span></h1>
                    <div className="hidden md:flex items-center gap-2 text-theme-text/50 text-sm font-bold bg-theme-surface px-4 py-2 rounded-full border border-theme-border/50 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                        <Calendar className="w-4 h-4" /> 
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-16 text-center rounded-[3rem] border border-theme-border/50 flex flex-col items-center justify-center gap-6"
                    >
                        <div className="w-24 h-24 rounded-full bg-theme-gold/10 flex items-center justify-center mb-2">
                            <Package className="w-12 h-12 text-theme-gold opacity-50" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-heading font-bold text-white mb-2">No Orders Yet</h3>
                            <p className="text-theme-text/50">Looks like you haven't placed any orders. Start exploring our menu!</p>
                        </div>
                        <button onClick={() => router.push('/menu')} className="btn-primary mt-4 px-8 py-3">
                            Explore Menu
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order, idx) => {
                            const statusStyle = getStatusDetails(order.orderStatus);
                            return (
                                <motion.div 
                                    key={order._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, ease: "easeOut" }}
                                    className="glass-panel p-8 rounded-[2.5rem] relative group hover:shadow-[0_8px_40px_rgba(212,184,134,0.08)] transition-all duration-500 overflow-hidden"
                                >
                                    {/* Subtle gradient background based on status */}
                                    {order.orderStatus === 'Delivered' && <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />}
                                    {order.orderStatus === 'Pending' && <div className="absolute inset-0 bg-gradient-to-r from-theme-gold/5 to-transparent pointer-events-none" />}

                                    <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="text-sm font-bold text-theme-gold/70 uppercase tracking-widest bg-theme-gold/10 px-3 py-1 rounded-full border border-theme-gold/20">
                                                    Order #{order._id.slice(-6).toUpperCase()}
                                                </div>
                                                <div className="text-sm text-theme-text/40 font-semibold flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(order.timestamp).toLocaleString(undefined, {
                                                        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3 mb-6 pl-2">
                                                {order.cartItems?.map((item: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 text-lg font-bold text-white/90">
                                                            <span className="text-theme-gold/50">{item.quantity || 1}x</span>
                                                            <span>{item.name}</span>
                                                        </div>
                                                        {order.orderStatus === 'Delivered' && (
                                                            <button
                                                                onClick={() => setReviewConfig({ isOpen: true, foodId: item.id || item._id, foodName: item.name })}
                                                                className="text-[10px] font-bold uppercase tracking-wider text-theme-gold hover:text-theme-bg bg-theme-gold/10 hover:bg-theme-gold px-3 py-1.5 rounded-full transition-colors border border-theme-gold/20"
                                                            >
                                                                Review
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Progress Bar for active orders */}
                                            {order.orderStatus !== 'Cancelled' && (
                                                <div className="mt-6 mb-2">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-theme-text/40 mb-2">
                                                        <span className={statusStyle.progress >= 25 ? "text-theme-gold" : ""}>Pending</span>
                                                        <span className={statusStyle.progress >= 50 ? "text-orange-400" : ""}>Preparing</span>
                                                        <span className={statusStyle.progress >= 75 ? "text-blue-400" : ""}>On The Way</span>
                                                        <span className={statusStyle.progress >= 100 ? "text-green-400" : ""}>Delivered</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-theme-surface rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${statusStyle.progress}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`h-full rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-500' : 'bg-theme-gold'} shadow-[0_0_10px_currentColor]`}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {['Pending', 'Preparing', 'Ready', 'Out for Delivery'].includes(order.orderStatus) && (
                                                <LiveTrackingMap orderId={order._id} status={order.orderStatus} driverName={order.driverName} />
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-col justify-between items-start lg:items-end min-w-[200px] border-t lg:border-t-0 lg:border-l border-theme-border/50 pt-6 lg:pt-0 lg:pl-8">
                                            <div className="w-full flex justify-between lg:block lg:text-right mb-6">
                                                <div className="text-sm font-semibold text-theme-text/50 uppercase tracking-wider mb-1">Total Amount</div>
                                                <div className="text-4xl font-heading font-extrabold text-theme-gold">₹{order.totalAmount.toFixed(2)}</div>
                                            </div>
                                            
                                            <div className="flex flex-col lg:items-end gap-3 w-full">
                                                <div className={`flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} shadow-[0_4px_15px_rgba(0,0,0,0.1)] w-fit`}>
                                                    {statusStyle.icon} {order.orderStatus}
                                                </div>
                                                
                                                {['Pending', 'Preparing', 'Ready'].includes(order.orderStatus) && (
                                                    <button 
                                                        onClick={() => cancelOrder(order._id)}
                                                        className="text-xs font-bold text-red-400 hover:text-[#040A07] bg-red-500/10 hover:bg-red-400 px-5 py-2.5 rounded-full transition-all duration-300 border border-red-500/20 hover:border-transparent mt-2 w-fit flex items-center gap-1.5"
                                                    >
                                                        <XCircle className="w-4 h-4" /> Cancel Order
                                                    </button>
                                                )}

                                                {order.orderStatus === 'Delivered' && (
                                                    <div className="flex flex-col gap-2 mt-2 w-full lg:items-end">
                                                        <button 
                                                            onClick={() => {
                                                                localStorage.setItem('cart', JSON.stringify(order.cartItems));
                                                                toast.success('Cart updated! Redirecting to checkout...');
                                                                setTimeout(() => router.push('/cart'), 1000);
                                                            }}
                                                            className="text-xs font-bold text-black hover:text-white bg-theme-gold hover:bg-theme-gold/80 px-5 py-2.5 rounded-full transition-all duration-300 border border-theme-gold hover:border-transparent w-fit flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,184,134,0.3)] hover:shadow-[0_0_20px_rgba(212,184,134,0.5)]"
                                                        >
                                                            <Package className="w-4 h-4" /> 1-Tap Reorder
                                                        </button>
                                                        <button 
                                                            onClick={() => window.open(`/receipt/${order._id}`, '_blank')}
                                                            className="text-xs font-bold text-white hover:text-black bg-white/10 hover:bg-white px-5 py-2.5 rounded-full transition-all duration-300 border border-white/20 hover:border-transparent w-fit flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                                        >
                                                            <Printer className="w-4 h-4" /> View Receipt
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
            />

            <ReviewModal
                isOpen={reviewConfig.isOpen}
                foodId={reviewConfig.foodId}
                foodName={reviewConfig.foodName}
                userEmail={user?.email}
                onClose={() => setReviewConfig({ ...reviewConfig, isOpen: false })}
            />
        </main>
    );
}
