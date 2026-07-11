'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, MapPin, Phone, CreditCard, Clock, UtensilsCrossed, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function ReceiptPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [printTime, setPrintTime] = useState<string>('');

    useEffect(() => {
        setPrintTime(new Date().toLocaleString());
        const fetchOrder = async () => {
            try {
                const id = params.id as string;
                if (!id) return;
                
                const res = await fetch(`/api/orders/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setOrder(data.order);
                    } else {
                        toast.error('Order not found');
                        router.push('/orders');
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load receipt');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [params, router]);

    if (isLoading) return <div className="min-h-screen bg-[#040A07] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#D4B886] border-t-transparent rounded-full animate-spin"></div></div>;
    if (!order) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const subtotal = order.cartItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = subtotal * 0.05;
    const delivery = subtotal > 0 ? 40 : 0;
    const totalBeforeDiscounts = subtotal + tax + delivery;
    const totalDiscount = Math.max(0, totalBeforeDiscounts - order.totalAmount);

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 print:block print:min-h-0 print:bg-white print:py-0 print:px-0">
            {/* Top Action Bar (Hidden in Print) */}
            <div className="w-full max-w-3xl mb-6 flex justify-between items-center print:hidden">
                <button 
                    onClick={() => router.push('/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Orders
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#040A07] text-[#D4B886] px-5 py-2.5 rounded-xl font-bold hover:bg-[#D4B886] hover:text-[#040A07] transition-colors shadow-lg"
                >
                    <Printer className="w-5 h-5" />
                    Print Receipt
                </button>
            </div>

            {/* Receipt Container */}
            <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 print:max-w-none print:w-full print:shadow-none print:border-none print:rounded-none print:overflow-visible">
                
                {/* Header (Brand & Status) */}
                <div className="bg-[#040A07] text-white p-8 sm:p-12 relative overflow-hidden print:overflow-visible print:bg-black print:p-6 print:pb-4">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4B886]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 print:hidden"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 border border-[#D4B886] rounded-full flex items-center justify-center">
                                    <span className="text-[#D4B886] font-serif font-bold text-xl">F</span>
                                </div>
                                <span className="font-heading font-extrabold text-2xl tracking-widest text-[#D4B886]">
                                    FEASTIFY
                                </span>
                            </div>
                            <p className="text-white/60 text-xs tracking-widest uppercase">Premium Dining Experience</p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <h1 className="text-3xl font-bold uppercase tracking-widest mb-1 text-white">Receipt</h1>
                                <p className="text-[#D4B886] font-mono font-bold tracking-wider mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded border border-white/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    <p className="text-[9px] text-white/80 font-mono tracking-widest uppercase">Auth: {order._id.slice(0, 4)}{order._id.slice(-4)}</p>
                                </div>
                            </div>
                            <div className="hidden sm:block bg-white p-2 rounded-lg shadow-sm">
                                <QRCode 
                                    value={typeof window !== 'undefined' ? window.location.href : `feastify.com/receipt/${order._id}`} 
                                    size={60} 
                                    bgColor="#ffffff" 
                                    fgColor="#000000" 
                                    level="L" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 sm:p-12 print:px-6 print:py-4 relative overflow-hidden">
                    
                    {/* Security Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] print:opacity-[0.05] z-0 select-none">
                        <div className="transform -rotate-45 font-heading text-9xl sm:text-[150px] font-extrabold tracking-tighter whitespace-nowrap text-gray-900">
                            FEASTIFY
                        </div>
                    </div>

                    {/* Status Stamp */}
                    <div className="absolute top-12 right-12 sm:top-16 sm:right-16 print:top-6 print:right-6 opacity-20 print:opacity-30 transform rotate-12 pointer-events-none z-0">
                        <div className={`border-4 sm:border-8 rounded-xl px-4 py-2 sm:px-6 sm:py-3 font-heading font-extrabold text-2xl sm:text-4xl tracking-widest uppercase ${
                            order.orderStatus === 'Delivered' ? 'border-green-600 text-green-600' :
                            order.orderStatus === 'Cancelled' ? 'border-red-600 text-red-600' :
                            'border-blue-600 text-blue-600'
                        }`}>
                            {order.orderStatus === 'Pending' ? 'PAID' : order.orderStatus}
                        </div>
                    </div>
                    
                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:gap-4 mb-8 print:mb-4 relative z-10">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#D4B886]" /> Order Timeline
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">Placed:</span> <span className="font-medium">{formatDate(order.timestamp)}</span></p>
                                {order.deliveredAt && (
                                    <p className="text-sm text-gray-800"><span className="text-gray-500 w-20 inline-block">Delivered:</span> <span className="font-medium">{formatDate(order.deliveredAt)}</span></p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#D4B886]" /> Delivery Details
                            </h3>
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900">{order.customerDetails.name || `${order.customerDetails.firstName || ''} ${order.customerDetails.lastName || ''}`.trim() || 'Valued Customer'}</p>
                                <p className="text-sm text-gray-600">{order.customerDetails.phone}</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{order.customerDetails.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-px bg-gray-200 mb-6"></div>

                    {/* Items Table */}
                    <div className="mb-8 print:mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-[#D4B886]" /> Order Summary
                        </h3>
                        
                        <div className="w-full">
                            {/* Table Header */}
                            <div className="flex border-b-2 border-gray-900 pb-2 mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                                <div className="flex-1">Item Description</div>
                                <div className="w-16 text-center">Qty</div>
                                <div className="w-24 text-right">Price</div>
                                <div className="w-24 text-right">Total</div>
                            </div>
                            
                            {/* Table Rows */}
                            <div className="space-y-3">
                                {order.cartItems.map((item: any, i: number) => (
                                    <div key={i} className="flex text-sm text-gray-800">
                                        <div className="flex-1 font-medium">{item.name}</div>
                                        <div className="w-16 text-center text-gray-500">{item.quantity}</div>
                                        <div className="w-24 text-right text-gray-500">₹{item.price.toFixed(2)}</div>
                                        <div className="w-24 text-right font-bold">₹{(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Totals & Payment */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8 print:gap-4">
                        <div className="bg-gray-50 p-6 rounded-xl w-full sm:w-1/2 border border-gray-100 print:bg-transparent print:border-gray-200 print:p-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#D4B886]" /> Payment Method
                            </h3>
                            <p className="font-bold text-gray-900 text-lg uppercase tracking-wider">{order.paymentMethod}</p>
                            
                            {order.driverInfo && (
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 mb-1">Delivered by</p>
                                    <p className="font-medium text-gray-800">{order.driverInfo.name}</p>
                                </div>
                            )}
                        </div>

                        <div className="w-full sm:w-1/2 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax (5%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Delivery Fee</span>
                                <span>₹{delivery.toFixed(2)}</span>
                            </div>
                            
                            {(order.appliedCoupon || totalDiscount > 0) && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount {order.appliedCoupon ? `(${order.appliedCoupon})` : '(Points/Promo)'}</span>
                                    <span>-₹{totalDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="w-full h-px bg-gray-200 my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900 uppercase tracking-widest text-sm">Total Paid</span>
                                <span className="text-2xl font-extrabold text-[#040A07]">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer & Acknowledgement */}
                <div className="bg-[#040A07] text-white p-8 print:p-6 mt-auto rounded-b-2xl print:rounded-none print:bg-white print:text-black">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 print:gap-2 border-b border-white/10 print:border-black/10 pb-6 print:pb-4 mb-6 print:mb-4">
                        <div className="text-center sm:text-left">
                            <p className="text-[#D4B886] font-bold font-serif italic text-2xl mb-2">Thank you for dining with us.</p>
                            <p className="text-white/60 print:text-black/60 text-sm">Experience the art of flavor, delivered directly to your door.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border border-[#D4B886]/30 flex items-center justify-center">
                                <span className="text-[#D4B886] font-serif font-bold text-xl">F</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 print:gap-4 text-sm text-center sm:text-left">
                        <div className="flex flex-col items-center sm:items-start gap-2">
                            <div className="flex items-center gap-2 text-[#D4B886]">
                                <MapPin className="w-4 h-4" />
                                <span className="font-bold tracking-wider uppercase text-xs">Address</span>
                            </div>
                            <span className="text-white/70 print:text-black/70">Anthiyur, Erode District,<br/>Tamil Nadu, India 638502</span>
                        </div>
                        
                        <div className="flex flex-col items-center sm:items-start gap-2">
                            <div className="flex items-center gap-2 text-[#D4B886]">
                                <Phone className="w-4 h-4" />
                                <span className="font-bold tracking-wider uppercase text-xs">Phone</span>
                            </div>
                            <span className="text-white/70 print:text-black/70">7305164503</span>
                        </div>

                        <div className="flex flex-col items-center sm:items-start gap-2">
                            <div className="flex items-center gap-2 text-[#D4B886]">
                                <Mail className="w-4 h-4" />
                                <span className="font-bold tracking-wider uppercase text-xs">Email</span>
                            </div>
                            <span className="text-white/70 print:text-black/70">admin.zylron.feastify<br className="hidden sm:block"/>@gmail.com</span>
                        </div>
                    </div>

                    <div className="text-[10px] sm:text-xs text-white/50 print:text-black/60 italic mt-8 print:mt-4 pt-5 print:pt-3 border-t border-white/10 print:border-black/10 text-center tracking-wide leading-relaxed">
                        <strong className="uppercase tracking-widest mb-2 block text-white/70 print:text-black/80 font-bold not-italic">Order Acknowledgement</strong>
                        This is a computer-generated receipt and requires no physical signature.<br/>
                        For any queries, feedback, or support regarding your order, please reach out to our team at<br/>
                        <span className="font-semibold text-[#D4B886] not-italic">admin.zylron.feastify@gmail.com</span> or call us at <span className="font-semibold text-[#D4B886] not-italic">7305164503</span>.
                    </div>
                    
                    <div className="mt-4 print:mt-2 text-center">
                        <span className="inline-block px-3 py-1 border border-white/10 print:border-black/20 rounded text-[9px] text-white/40 print:text-black/50 font-mono">
                            Generated securely on: {printTime}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Custom Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0.5cm; size: A4 portrait; }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        background: white; 
                        margin: 0;
                        padding: 0;
                    }
                    * {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </main>
    );
}
