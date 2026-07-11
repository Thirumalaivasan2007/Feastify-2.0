import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminKDS({ orders, updateOrderStatus }: { orders: any[], updateOrderStatus: (id: string, status: string) => Promise<void> }) {
    // We only care about active orders for the Kitchen Display
    const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.orderStatus));

    // Separate into columns
    const pendingOrders = activeOrders.filter(o => o.orderStatus === 'Pending').sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const preparingOrders = activeOrders.filter(o => o.orderStatus === 'Preparing').sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const readyOrders = activeOrders.filter(o => o.orderStatus === 'Ready'); // For kitchen, Ready means it's ready for driver pick up

    const formatTimeAgo = (dateString: string) => {
        const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 60000); // in minutes
        if (diff < 1) return 'Just now';
        return `${diff} min ago`;
    };

    const isUrgent = (dateString: string) => {
        return (new Date().getTime() - new Date(dateString).getTime()) > 20 * 60000; // Urgent if > 20 mins
    };

    const OrderCard = ({ order, nextStatus, nextLabel, icon: Icon }: any) => (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`bg-white/5 border rounded-2xl p-5 shadow-lg relative overflow-hidden ${isUrgent(order.timestamp) ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'}`}
        >
            {isUrgent(order.timestamp) && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> URGENT
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-mono text-theme-gold font-bold mb-1">#{order._id.slice(-6).toUpperCase()}</h4>
                    <p className="text-white font-bold text-sm">{order.customerDetails.name || order.customerDetails.firstName}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50 bg-black/40 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span className={isUrgent(order.timestamp) ? 'text-red-400 font-bold' : ''}>{formatTimeAgo(order.timestamp)}</span>
                </div>
            </div>

            <div className="space-y-2 mb-6">
                {order.cartItems.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
                        <div className="bg-theme-surface text-theme-gold font-bold w-6 h-6 flex items-center justify-center rounded-md text-xs shrink-0 border border-theme-gold/20">
                            {item.quantity}
                        </div>
                        <span className="text-white/90 text-sm font-medium pt-0.5 leading-tight">{item.name}</span>
                    </div>
                ))}
            </div>

            {nextStatus && (
                <button 
                    onClick={() => updateOrderStatus(order._id, nextStatus)}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 bg-gradient-gold text-black shadow-[0_0_15px_rgba(212,184,134,0.3)] hover:shadow-[0_0_25px_rgba(212,184,134,0.5)]"
                >
                    <Icon className="w-4 h-4" />
                    {nextLabel}
                </button>
            )}
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-extrabold text-white mb-2">Kitchen Display System</h2>
                    <p className="text-theme-text/60 text-sm">Real-time order tracking for kitchen staff.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                
                {/* Pending Column */}
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-white">
                            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                            New Orders
                        </h3>
                        <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full text-xs border border-blue-500/30">
                            {pendingOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {pendingOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextStatus="Preparing" nextLabel="Start Preparing" icon={UtensilsCrossed} />
                        ))}
                        {pendingOrders.length === 0 && (
                            <div className="text-center text-white/30 text-sm mt-10 italic">No new orders</div>
                        )}
                    </div>
                </div>

                {/* Preparing Column */}
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-white">
                            <span className="w-3 h-3 rounded-full bg-theme-gold animate-pulse"></span>
                            Preparing
                        </h3>
                        <span className="bg-theme-gold/20 text-theme-gold font-bold px-2 py-0.5 rounded-full text-xs border border-theme-gold/30">
                            {preparingOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {preparingOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextStatus="Ready" nextLabel="Ready for Driver" icon={Check} />
                        ))}
                        {preparingOrders.length === 0 && (
                            <div className="text-center text-white/30 text-sm mt-10 italic">No active prep</div>
                        )}
                    </div>
                </div>

                {/* Ready Column */}
                <div className="bg-black/20 rounded-3xl p-5 border border-white/5 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-heading font-bold text-lg flex items-center gap-2 text-white">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            Waiting for Driver
                        </h3>
                        <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full text-xs border border-green-500/30">
                            {readyOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {readyOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextStatus={null} /> // Driver handles the next step
                        ))}
                        {readyOrders.length === 0 && (
                            <div className="text-center text-white/30 text-sm mt-10 italic">No orders waiting</div>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
