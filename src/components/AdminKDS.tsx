import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, UtensilsCrossed, AlertTriangle, Square, CheckSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminKDS({ orders, updateOrderStatus }: { orders: any[], updateOrderStatus: (id: string, status?: string, kdsDetails?: any) => Promise<void> }) {
    // We only care about active orders for the Kitchen Display
    const activeOrders = orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.orderStatus));

    // Separate into columns
    const pendingOrders = activeOrders.filter(o => o.orderStatus === 'Pending').sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const preparingOrders = activeOrders.filter(o => o.orderStatus === 'Preparing').sort((a, b) => {
        const timeA = new Date(a.kdsDetails?.prepStartTime || a.timestamp).getTime();
        const timeB = new Date(b.kdsDetails?.prepStartTime || b.timestamp).getTime();
        return timeA - timeB;
    });
    const readyOrders = activeOrders.filter(o => o.orderStatus === 'Ready');

    // State for Prep Time Modal
    const [prepModalOpen, setPrepModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [selectedPrepTime, setSelectedPrepTime] = useState(15);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStartPreparing = async () => {
        if (!selectedOrderId) return;
        setIsUpdating(true);
        try {
            await updateOrderStatus(selectedOrderId, 'Preparing', {
                prepStartTime: new Date(),
                estimatedPrepTime: selectedPrepTime,
                completedItems: []
            });
            setPrepModalOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
            setSelectedOrderId(null);
        }
    };

    const OrderCard = ({ order, nextStatus, nextLabel, icon: Icon }: any) => {
        const [now, setNow] = useState(Date.now());
        
        useEffect(() => {
            if (order.orderStatus === 'Preparing') {
                const interval = setInterval(() => setNow(Date.now()), 1000);
                return () => clearInterval(interval);
            }
        }, [order.orderStatus]);

        const formatTimeAgo = (dateString: string) => {
            const diff = Math.floor((now - new Date(dateString).getTime()) / 60000);
            if (diff < 1) return 'Just now';
            return `${diff} min ago`;
        };

        const isUrgent = (dateString: string) => {
            return (now - new Date(dateString).getTime()) > 20 * 60000;
        };

        let isOverdue = false;
        let timerDisplay = '';
        
        if (order.orderStatus === 'Preparing' && order.kdsDetails?.prepStartTime) {
            const endTime = new Date(order.kdsDetails.prepStartTime).getTime() + (order.kdsDetails.estimatedPrepTime * 60000);
            const diffSeconds = Math.floor((endTime - now) / 1000);
            isOverdue = diffSeconds < 0;
            const absSec = Math.abs(diffSeconds);
            const mins = Math.floor(absSec / 60);
            const secs = absSec % 60;
            timerDisplay = `${isOverdue ? '-' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
        }

        const completedItems = order.kdsDetails?.completedItems || [];
        const allItemsCompleted = order.cartItems.length > 0 && completedItems.length === order.cartItems.length;

        const toggleItem = async (index: string) => {
            if (order.orderStatus !== 'Preparing') return; // Only check off if preparing
            
            const newCompleted = completedItems.includes(index) 
                ? completedItems.filter((i: string) => i !== index)
                : [...completedItems, index];
                
            await updateOrderStatus(order._id, undefined, { completedItems: newCompleted });
        };

        const handleNextAction = () => {
            if (order.orderStatus === 'Pending') {
                setSelectedOrderId(order._id);
                setPrepModalOpen(true);
            } else if (order.orderStatus === 'Preparing') {
                if (allItemsCompleted) {
                    updateOrderStatus(order._id, 'Ready');
                } else {
                    toast.error('Must complete all items first!');
                }
            }
        };

        return (
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-white/5 border rounded-2xl p-5 shadow-lg relative overflow-hidden ${
                    isOverdue || (order.orderStatus === 'Pending' && isUrgent(order.timestamp)) 
                        ? 'border-red-500/50 bg-red-500/5' 
                        : 'border-white/10'
                }`}
            >
                {/* Urgent Banner */}
                {(isOverdue || (order.orderStatus === 'Pending' && isUrgent(order.timestamp))) && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> URGENT
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="font-mono text-theme-gold font-bold mb-1">#{order._id.slice(-6).toUpperCase()}</h4>
                        <p className="text-white font-bold text-sm">{order.customerDetails.name || order.customerDetails.firstName}</p>
                    </div>
                    
                    {/* Timer Logic */}
                    {order.orderStatus === 'Preparing' && order.kdsDetails?.prepStartTime ? (
                        <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-1 rounded-md ${isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-black/40 text-theme-gold'}`}>
                            <Clock className="w-3 h-3" />
                            {timerDisplay}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs text-white/50 bg-black/40 px-2 py-1 rounded-md">
                            <Clock className="w-3 h-3" />
                            <span className={isUrgent(order.timestamp) ? 'text-red-400 font-bold' : ''}>{formatTimeAgo(order.timestamp)}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2 mb-6">
                    {order.cartItems.map((item: any, i: number) => {
                        const idxStr = i.toString();
                        const isDone = completedItems.includes(idxStr);
                        
                        return (
                            <div 
                                key={i} 
                                onClick={() => toggleItem(idxStr)}
                                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all duration-300 ${
                                    order.orderStatus === 'Preparing' ? 'cursor-pointer hover:bg-white/10' : ''
                                } ${
                                    isDone 
                                        ? 'bg-green-500/10 border-green-500/30' 
                                        : 'bg-black/20 border-white/5'
                                }`}
                            >
                                {order.orderStatus === 'Preparing' && (
                                    <div className="pt-0.5 shrink-0 text-white/50">
                                        {isDone ? <CheckSquare className="w-5 h-5 text-green-400" /> : <Square className="w-5 h-5" />}
                                    </div>
                                )}
                                {!order.orderStatus.includes('Preparing') && (
                                    <div className="bg-theme-surface text-theme-gold font-bold w-6 h-6 flex items-center justify-center rounded-md text-xs shrink-0 border border-theme-gold/20">
                                        {item.quantity}
                                    </div>
                                )}
                                <span className={`text-sm font-medium pt-0.5 leading-tight ${isDone ? 'text-green-400/70 line-through' : 'text-white/90'}`}>
                                    {order.orderStatus === 'Preparing' && <span className="font-bold mr-1">{item.quantity}x</span>}
                                    {item.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {nextStatus && (
                    <button 
                        onClick={handleNextAction}
                        disabled={order.orderStatus === 'Preparing' && !allItemsCompleted}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            order.orderStatus === 'Preparing' && !allItemsCompleted
                                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                : 'hover:scale-[1.02] active:scale-95 bg-gradient-gold text-black shadow-[0_0_15px_rgba(212,184,134,0.3)] hover:shadow-[0_0_25px_rgba(212,184,134,0.5)]'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {nextLabel}
                    </button>
                )}
            </motion.div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full relative">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-extrabold text-white mb-2">Kitchen Display System</h2>
                    <p className="text-theme-text/60 text-sm">Real-time order tracking and dynamic prep checklists.</p>
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
                            Waiting for Pick-up
                        </h3>
                        <span className="bg-green-500/20 text-green-400 font-bold px-2 py-0.5 rounded-full text-xs border border-green-500/30">
                            {readyOrders.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {readyOrders.map(order => (
                            <OrderCard key={order._id} order={order} nextStatus={null} />
                        ))}
                        {readyOrders.length === 0 && (
                            <div className="text-center text-white/30 text-sm mt-10 italic">No orders waiting</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Set Prep Time Modal */}
            <AnimatePresence>
                {prepModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl max-w-sm w-full relative"
                        >
                            <button onClick={() => setPrepModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-2xl font-bold text-white mb-2">Set Prep Time</h3>
                            <p className="text-white/50 text-sm mb-6">How long will this order take to prepare?</p>
                            
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[5, 10, 15, 20, 30, 45].map((time) => (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedPrepTime(time)}
                                        className={`py-3 rounded-xl font-bold transition-all ${
                                            selectedPrepTime === time 
                                                ? 'bg-theme-gold text-black shadow-lg scale-105' 
                                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                                        }`}
                                    >
                                        {time} min
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                onClick={handleStartPreparing}
                                disabled={isUpdating}
                                className="w-full bg-gradient-gold text-black font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {isUpdating ? 'Starting...' : 'Start Cooking'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
