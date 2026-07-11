'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, User, Package, CreditCard, CalendarDays, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrderDetails() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Wait for params to be unwrapped (Next.js 15 requires it, but in client components useParams() is already unwrapped in some versions, however, we use the unwrapped value directly)
                const id = params.id as string;
                if (!id) return;
                
                const res = await fetch(`/api/orders/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setOrder(data.order);
                    } else {
                        toast.error(data.message || 'Order not found');
                        router.push('/admin');
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load order');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [params, router]);

    if (isLoading) return <div className="min-h-screen bg-theme-bg flex items-center justify-center"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>;
    if (!order) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12">
            <Navbar />
            
            <div className="max-w-5xl mx-auto px-6">
                <button 
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 text-theme-gold hover:text-theme-gold-light mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Admin Dashboard
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-heading font-extrabold flex items-center gap-4">
                        Order <span className="text-gradient">#{order._id.slice(-6).toUpperCase()}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                            order.orderStatus === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            order.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            order.orderStatus === 'Out for Delivery' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-theme-gold/10 text-theme-gold border-theme-gold/20'
                        }`}>
                            {order.orderStatus}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2 text-white">
                                <User className="w-5 h-5 text-theme-gold" />
                                Customer Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-theme-muted text-sm mb-1">Name</p>
                                    <p className="font-semibold text-lg">{order.customerDetails.firstName} {order.customerDetails.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-theme-muted text-sm mb-1">Email</p>
                                    <p className="font-medium">{order.customerDetails.email}</p>
                                </div>
                                <div>
                                    <p className="text-theme-muted text-sm mb-1">Phone</p>
                                    <p className="font-medium">{order.customerDetails.phone}</p>
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-theme-muted text-sm mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-theme-gold" />
                                    Delivery Address
                                </p>
                                <p className="font-medium leading-relaxed">{order.customerDetails.address}</p>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2 text-white">
                                <Package className="w-5 h-5 text-theme-gold" />
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.cartItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <span className="bg-white/5 px-3 py-1 rounded-md text-sm font-bold">{item.quantity}x</span>
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                        <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Timeline & Summary */}
                    <div className="space-y-6">
                        {/* Summary */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2 text-white">
                                <CreditCard className="w-5 h-5 text-theme-gold" />
                                Payment Summary
                            </h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-theme-muted">Payment Method</span>
                                    <span className="font-bold uppercase">{order.paymentMethod}</span>
                                </div>
                                {order.appliedCoupon && (
                                    <div className="flex justify-between text-sm text-[#22c55e]">
                                        <span>Coupon Applied</span>
                                        <span className="font-bold uppercase">{order.appliedCoupon}</span>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="font-bold text-lg text-white">Total</span>
                                <span className="text-2xl font-extrabold text-theme-gold">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Delivery Timeline */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold font-heading mb-6 flex items-center gap-2 text-white">
                                <Clock className="w-5 h-5 text-theme-gold" />
                                Delivery Timeline
                            </h2>
                            
                            <div className="relative pl-6 space-y-8 border-l border-white/10 ml-2">
                                {/* Ordered */}
                                <div className="relative">
                                    <div className="absolute -left-[33px] bg-theme-bg border border-theme-gold p-1 rounded-full text-theme-gold">
                                        <CalendarDays className="w-3 h-3" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">Order Placed</p>
                                        <p className="text-xs text-theme-muted mt-1">{formatDate(order.timestamp)}</p>
                                    </div>
                                </div>

                                {/* Driver Info */}
                                {order.driverInfo && (
                                    <div className="relative">
                                        <div className="absolute -left-[33px] bg-theme-bg border border-blue-500 p-1 rounded-full text-blue-500">
                                            <User className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-blue-400">Driver Assigned</p>
                                            <div className="bg-white/5 p-3 rounded-lg mt-2 border border-white/10">
                                                <p className="text-sm font-semibold">{order.driverInfo.name}</p>
                                                <p className="text-xs text-theme-muted mt-1">ID: {order.driverInfo.id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Delivered */}
                                {order.deliveredAt && (
                                    <div className="relative">
                                        <div className="absolute -left-[33px] bg-theme-bg border border-green-500 p-1 rounded-full text-green-500">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-green-400">Order Delivered</p>
                                            <p className="text-xs text-theme-muted mt-1">{formatDate(order.deliveredAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
