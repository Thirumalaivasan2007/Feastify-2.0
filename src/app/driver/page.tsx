'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle2, MapPin, Phone, User, TrendingUp, Search, Power, Navigation, IndianRupee, Map as MapIcon, Calendar, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { useRouter } from 'next/navigation';

export default function DriverDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<{ totalDeliveries: number, earnings: number, activeDeliveries: number, recentPayouts?: any[] }>({ totalDeliveries: 0, earnings: 0, activeDeliveries: 0, recentPayouts: [] });
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mainTab, setMainTab] = useState<'orders' | 'map' | 'earnings'>('orders');
    const [orderFilter, setOrderFilter] = useState<'available' | 'delivering' | 'completed'>('available');
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/');
            return;
        }
        
        const u = JSON.parse(userStr);
        if (u.role !== 'driver') {
            router.push('/');
            return;
        }
        setUser(u);

        const fetchData = async () => {
            try {
                // Ensure we have a valid ID (it might be stored as userId or _id depending on the login flow)
                const driverId = u.userId || u._id;
                
                // Fetch Stats
                const statsRes = await fetch(`/api/driver/stats?driverId=${driverId}`);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch Orders
                const res = await fetch('/api/orders');
                const data = await res.json();
                
                if (Array.isArray(data)) {
                    // Only show available orders, or orders claimed by THIS driver
                    const filteredData = data.filter((o: any) => {
                        if (o.orderStatus === 'Cancelled') return false;
                        if (o.driverId && o.driverId !== driverId) return false; // Claimed by someone else
                        return true;
                    });
                    
                    setOrders(filteredData);
                } else if (data && Array.isArray(data.orders)) {
                    const filteredData = data.orders.filter((o: any) => {
                        if (o.orderStatus === 'Cancelled') return false;
                        if (o.driverId && o.driverId !== driverId) return false; // Claimed by someone else
                        return true;
                    });
                    
                    setOrders(filteredData);
                } else {
                    console.error("Failed to fetch orders:", data);
                    setOrders([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // 15 sec refresh
        return () => clearInterval(interval);
    }, [router]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const currentDriverId = user?.userId || user?._id;
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    orderStatus: status,
                    driverId: currentDriverId,
                    driverName: user?.name 
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Order marked as ${status}`);
                
                // If delivered, increment local stats to show immediately
                if (status === 'Delivered') {
                    setStats(prev => ({
                        ...prev,
                        totalDeliveries: prev.totalDeliveries + 1,
                        earnings: prev.earnings + 5,
                        activeDeliveries: Math.max(0, prev.activeDeliveries - 1)
                    }));
                } else if (status === 'Out for Delivery') {
                    setStats(prev => ({
                        ...prev,
                        activeDeliveries: prev.activeDeliveries + 1
                    }));
                }
                
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status, driverId: currentDriverId } : o));
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection error');
        }
    };

    // Filter orders based on active tab
    const filteredOrders = orders.filter(o => {
        if (orderFilter === 'available') return o.orderStatus === 'Pending' || o.orderStatus === 'Preparing' || o.orderStatus === 'Ready';
        if (orderFilter === 'delivering') return o.orderStatus === 'Out for Delivery';
        return o.orderStatus === 'Delivered';
    });

    if (isLoading) return <div className="min-h-screen bg-theme-bg flex items-center justify-center"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-4xl font-heading font-extrabold flex items-center gap-4">
                        <TrendingUp className="w-8 h-8 text-theme-gold" />
                        Driver <span className="text-gradient">Dashboard</span>
                    </h1>
                    <button 
                        onClick={() => setIsOnline(!isOnline)}
                        className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                            isOnline 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                            : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                        }`}
                    >
                        <Power className="w-4 h-4" />
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex gap-2 p-1 bg-white/5 rounded-full border border-white/10 w-fit">
                        {['orders', 'map', 'earnings'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setMainTab(tab as any)}
                                className={`px-6 py-2.5 rounded-full font-bold text-sm capitalize transition-all duration-300 flex items-center gap-2 ${mainTab === tab ? 'bg-gradient-gold text-[#040A07] shadow-[0_0_20px_rgba(212,184,134,0.3)]' : 'text-theme-text/60 hover:text-theme-gold hover:bg-white/5'}`}
                            >
                                {tab === 'orders' && <Package className="w-4 h-4"/>}
                                {tab === 'map' && <MapIcon className="w-4 h-4"/>}
                                {tab === 'earnings' && <IndianRupee className="w-4 h-4"/>}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {mainTab === 'orders' && (
                    <>
                        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                            {['available', 'delivering', 'completed'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setOrderFilter(tab as any)}
                                    className={`px-4 py-1.5 rounded-lg font-bold text-xs capitalize transition-all duration-300 ${orderFilter === tab ? 'bg-theme-gold/20 text-theme-gold border border-theme-gold/30' : 'text-theme-text/50 hover:text-theme-text bg-white/5 border border-white/5'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AnimatePresence>
                                {!isOnline && orderFilter === 'available' ? (
                                    <div className="col-span-full py-20 text-center text-theme-text/50">
                                        <Power className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <h3 className="text-xl font-bold">You are Offline</h3>
                                        <p>Go online to start receiving delivery requests.</p>
                                    </div>
                                ) : filteredOrders.length === 0 ? (
                                    <div className="col-span-full py-20 text-center text-theme-text/50">
                                        <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <h3 className="text-xl font-bold">No orders here</h3>
                                        <p>You're all caught up!</p>
                                    </div>
                                ) : (
                            filteredOrders.map(order => (
                                <motion.div 
                                    key={order._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-panel p-6 rounded-3xl border border-theme-border/50 relative overflow-hidden"
                                >
                                    {order.orderStatus === 'Out for Delivery' && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none"></div>
                                    )}
                                    {order.orderStatus === 'Delivered' && (
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-bl-full pointer-events-none"></div>
                                    )}

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="text-xs text-theme-text/50 font-bold uppercase tracking-widest mb-1">Order #{order._id.slice(-6)}</div>
                                            <h3 className="text-2xl font-bold text-theme-text flex items-center gap-2">
                                                ₹{order.totalAmount.toFixed(2)}
                                                {order.paymentMethod === 'COD' && <span className="text-xs bg-theme-gold/20 text-theme-gold px-2 py-1 rounded-md border border-theme-gold/30">COD</span>}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-theme-gold mb-1 flex items-center justify-end gap-1">
                                                <Clock className="w-4 h-4" />
                                                {order.timestamp ? new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                            </div>
                                            <span className="text-xs text-theme-text/50 bg-white/5 px-2 py-1 rounded-full">{order.orderStatus}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <User className="w-5 h-5 text-theme-gold shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-theme-text/90">{order.customerDetails.name}</div>
                                                <div className="text-sm text-theme-text/60">{order.customerEmail}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <MapPin className="w-5 h-5 text-theme-gold shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-theme-text/90">Delivery Address</div>
                                                <div className="text-sm text-theme-text/60 mt-1 leading-relaxed">{order.customerDetails.address}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <Phone className="w-5 h-5 text-theme-gold shrink-0" />
                                            <div className="font-bold text-theme-text/90">{order.customerDetails.phone}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Order Items Breakdown */}
                                    <div className="mb-8 p-4 bg-black/20 rounded-2xl border border-white/5">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-theme-muted mb-3 flex items-center gap-2">
                                            <Package className="w-3 h-3" /> Order Items
                                        </h4>
                                        <div className="space-y-2">
                                            {order.cartItems?.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center text-sm">
                                                    <span className="text-theme-text/80"><span className="font-bold text-theme-text mr-2">{item.quantity}x</span> {item.name}</span>
                                                    <span className="text-theme-muted">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {orderFilter === 'available' && (
                                        <button 
                                            onClick={() => updateStatus(order._id, 'Out for Delivery')}
                                            className="w-full py-4 bg-gradient-gold text-[#040A07] rounded-xl font-extrabold flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(212,184,134,0.4)] transition-all"
                                        >
                                            <Package className="w-5 h-5" /> Accept & Start Delivery
                                        </button>
                                    )}
                                    {orderFilter === 'delivering' && (
                                        <button 
                                            onClick={() => updateStatus(order._id, 'Delivered')}
                                            className="w-full py-4 bg-green-500 hover:bg-green-400 text-black rounded-xl font-extrabold flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
                                        >
                                            <CheckCircle2 className="w-5 h-5" /> Mark as Delivered
                                        </button>
                                    )}
                                    {orderFilter === 'completed' && (
                                        <div className="w-full py-4 bg-white/5 text-theme-text/50 rounded-xl font-bold flex justify-center items-center gap-2 border border-white/10">
                                            <CheckCircle2 className="w-5 h-5" /> Delivery Completed
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
                </>
                )}

                {/* Earnings Tab */}
                {mainTab === 'earnings' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 flex flex-col justify-center bg-gradient-to-br from-theme-gold/10 to-transparent relative overflow-hidden border-theme-gold/30">
                                <div className="absolute top-4 right-4"><TrendingUp className="w-8 h-8 text-theme-gold opacity-50" /></div>
                                <span className="text-theme-gold text-xs font-bold uppercase tracking-wider mb-2">Total Earnings</span>
                                <span className="text-4xl font-extrabold text-theme-text">₹{(stats.earnings * 82).toFixed(2)}</span>
                            </div>
                            <div className="glass-card p-6 flex flex-col justify-center">
                                <span className="text-theme-muted text-xs font-bold uppercase tracking-wider mb-2">Total Deliveries</span>
                                <span className="text-4xl font-extrabold text-theme-text">{stats.totalDeliveries}</span>
                            </div>
                            <div className="glass-card p-6 flex flex-col justify-center">
                                <span className="text-theme-muted text-xs font-bold uppercase tracking-wider mb-2">Active Deliveries</span>
                                <span className="text-4xl font-extrabold text-[#22c55e]">{stats.activeDeliveries}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-xl"><Calendar className="w-5 h-5 text-theme-gold" /> Payout History</h3>
                            <div className="glass-panel rounded-2xl border border-theme-border/50 p-6 space-y-4">
                                {(stats.recentPayouts?.length ?? 0) > 0 ? stats.recentPayouts!.map((payout: any, idx: number) => (
                                    <div key={payout.id} className={`flex justify-between items-center py-2 ${idx > 0 ? 'border-t border-white/10 mt-2 pt-4' : ''}`}>
                                        <div>
                                            <p className="font-bold text-theme-text/90">
                                                {new Date(payout.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-theme-text/50">{payout.status}</p>
                                        </div>
                                        <span className="font-bold text-lg text-theme-text/80">₹{payout.amount.toFixed(2)}</span>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-theme-text/50">No recent payouts</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Map Tab */}
                {mainTab === 'map' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[60vh] rounded-3xl overflow-hidden relative border border-theme-border/50">
                        {stats.activeDeliveries > 0 ? (
                            <>
                                {/* Mock Map Background */}
                                <div className="absolute inset-0 bg-[#0A0A0A]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '30px 30px' }}>
                                    {/* Route Path SVG */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
                                        <path d="M 400,100 C 450,150 400,300 500,400 C 600,500 300,550 200,450" fill="none" stroke="rgba(212,184,134,0.4)" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 10" />
                                        <path d="M 400,100 C 450,150 400,300 500,400" fill="none" stroke="#D4B886" strokeWidth="6" strokeLinecap="round" />
                                        
                                        {/* Moving car/driver dot */}
                                        <motion.circle r="12" fill="#D4B886" className="drop-shadow-[0_0_10px_rgba(212,184,134,0.8)]">
                                            <animateMotion dur="6s" repeatCount="indefinite" path="M 400,100 C 450,150 400,300 500,400" />
                                        </motion.circle>
                                    </svg>
                                    
                                    {/* Pins */}
                                    <div className="absolute top-[80px] left-[380px] w-12 h-12 bg-[#040A07] border-2 border-theme-gold rounded-full flex items-center justify-center shadow-2xl z-10">
                                        <MapPin className="w-5 h-5 text-theme-gold" />
                                    </div>
                                    <div className="absolute top-[380px] left-[480px] w-12 h-12 bg-[#040A07] border-2 border-blue-500 rounded-full flex items-center justify-center shadow-2xl z-10 animate-bounce">
                                        <User className="w-5 h-5 text-blue-500" />
                                    </div>
                                </div>

                                {/* Map Overlay UI */}
                                <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-96 glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl bg-[#040A07]/90 backdrop-blur-xl">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="font-heading font-extrabold text-3xl text-theme-gold">8 mins</h3>
                                            <p className="text-sm text-theme-text/60 font-bold mt-1">1.2 km • To Customer</p>
                                        </div>
                                        <button className="bg-theme-gold text-black w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,184,134,0.4)] transition-transform active:scale-95">
                                            <Navigation className="w-6 h-6 ml-[-2px] mt-[-2px]" />
                                        </button>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-blue-400" /></div>
                                        <div>
                                            <p className="text-sm font-bold text-theme-text/90">Leave at door</p>
                                            <p className="text-xs text-theme-text/50 mt-1">Please do not ring the doorbell. Baby is sleeping.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                                    <MapPin className="w-8 h-8 text-theme-text/20" />
                                </div>
                                <h3 className="text-2xl font-bold font-heading mb-2 text-theme-text/90">No Active Route</h3>
                                <p className="text-theme-text/50 max-w-sm leading-relaxed">You don't have any active deliveries assigned right now. When you accept a new order, your turn-by-turn navigation route will appear here.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </main>
    );
}
