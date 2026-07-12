'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, CreditCard, Wallet, CheckCircle2, ShoppingBag, MapPin, Phone, Star, Tag, Gift, Navigation, Banknote, ShieldCheck, ArrowRight, CheckCircle, Users, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Recommendations from '@/components/Recommendations';

const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function CartPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [deliveryCoordinates, setDeliveryCoordinates] = useState<{lat: number, lng: number} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const router = useRouter();
    const [usePoints, setUsePoints] = useState(false);
    
    // Promo code state
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<any>(null);
    const [promoError, setPromoError] = useState('');
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
            return;
        }
        const u = JSON.parse(userStr);
        if (u.role === 'admin' || u.role === 'driver') {
            router.push(u.role === 'admin' ? '/admin' : '/driver');
            return;
        }
        setUser(u);
        setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
        
        // Fetch fresh user data for accurate FeastPoints
        fetch(`/api/users/${u.userId || u._id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify({ ...u, ...data.user }));
                }
            })
            .catch(console.error);
    }, [router]);

    const updateQuantity = (idx: number, delta: number) => {
        const newCart = [...cart];
        newCart[idx].quantity = (newCart[idx].quantity || 1) + delta;
        if (newCart[idx].quantity <= 0) newCart.splice(idx, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (idx: number) => {
        const newCart = [...cart];
        newCart.splice(idx, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = subtotal * 0.05;
    const delivery = subtotal > 0 ? 40 : 0;
    
    // Promo logic
    const handleApplyPromo = async () => {
        setPromoError('');
        if (!promoCode.trim()) return;
        setIsValidatingPromo(true);
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode, orderValue: subtotal })
            });
            const data = await res.json();
            if (data.success) {
                setAppliedPromo(data.coupon);
                toast.success('Promo code applied!');
            } else {
                setPromoError(data.message);
            }
        } catch (e) {
            setPromoError('Failed to validate code');
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const promoDiscount = appliedPromo 
        ? (appliedPromo.discountType === 'percentage' 
            ? subtotal * (appliedPromo.discountValue / 100) 
            : appliedPromo.discountValue)
        : 0;
    
    // 1 Point = ₹1 discount. Max points to use cannot exceed subtotal.
    const availablePoints = user?.feastPoints || 0;
    const maxPointsUsable = Math.min(availablePoints, subtotal - promoDiscount);
    const pointsDiscount = usePoints ? maxPointsUsable : 0;
    
    const total = Math.max(0, subtotal + tax + delivery - pointsDiscount - promoDiscount);

    const [newOrderId, setNewOrderId] = useState<string | null>(null);

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please log in to checkout');
            router.push('/');
            return;
        }
        if (!phone.trim() || !address.trim()) return toast.error('Please enter delivery details');
        if (!deliveryCoordinates) return toast.error('Please pin your exact delivery location on the map');
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }
        
        setIsProcessing(true);
        
        try {
            const orderData = {
                customerDetails: {
                    name: user.name,
                    email: user.email,
                    phone: phone,
                    address: address
                },
                customerEmail: user.email,
                cartItems: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1
                })),
                totalAmount: total,
                paymentMethod: paymentMethod,
                orderStatus: 'Pending',
                pointsUsed: pointsDiscount,
                appliedCoupon: appliedPromo ? appliedPromo.code : null,
                deliveryCoordinates
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            
            if (data.success) {
                setNewOrderId(data.orderId);
                localStorage.removeItem('cart');
                window.dispatchEvent(new Event('cartUpdated'));
                setShowSuccessModal(true);
            } else {
                toast.error('Checkout failed: ' + data.message);
                setIsProcessing(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection error');
            setIsProcessing(false);
        }
    };

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4">
                    <h1 className="text-4xl font-heading font-extrabold">Secure <span className="text-gradient">Checkout</span></h1>
                    <button 
                        onClick={() => setShowGroupInfo(true)}
                        className="bg-theme-surface/50 border border-theme-border/50 hover:border-theme-gold/40 hover:bg-theme-gold/10 px-6 py-2.5 rounded-full flex items-center gap-2 text-sm font-bold text-theme-gold transition-all w-fit shadow-[0_0_15px_rgba(212,184,134,0.1)] hover:shadow-[0_0_25px_rgba(212,184,134,0.2)] backdrop-blur-md"
                    >
                        <Users className="w-4 h-4" /> Start Group Order
                        <div className="w-px h-4 bg-theme-border/50 mx-2"></div>
                        <LinkIcon className="w-3.5 h-3.5 text-white/50" />
                    </button>
                </div>
                
                {cart.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <Wallet className="w-16 h-16 mx-auto mb-4 text-white/20" />
                        <h2 className="text-2xl font-bold text-white/70 mb-4">Your cart is empty</h2>
                        <button onClick={() => router.push('/menu')} className="btn-primary mb-12">
                            Explore Menu
                        </button>

                        {/* Empty Cart Banner for Group Orders */}
                        <div className="max-w-xl w-full bg-gradient-to-r from-theme-gold/20 to-transparent border border-theme-gold/30 rounded-[2rem] p-8 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-theme-gold/10 rounded-full blur-3xl" />
                            <Users className="w-10 h-10 text-theme-gold mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Ordering for a group?</h3>
                            <p className="text-theme-text/80 mb-6">Start a Group Order, share the link with your friends, and let them add their favorite dishes directly into your cart.</p>
                            <button 
                                onClick={() => setShowGroupInfo(true)}
                                className="text-theme-gold font-bold flex items-center gap-2 hover:text-white transition-colors"
                            >
                                Learn More <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cart.map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-5 rounded-[2rem] flex items-center gap-6 group"
                                >
                                    <div className="relative w-24 h-24 overflow-hidden rounded-2xl">
                                        <div className="absolute inset-0 bg-theme-gold/10 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-xl mb-1 text-white/90">{item.name}</h3>
                                        <p className="text-theme-gold font-bold text-lg">₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-theme-surface rounded-full px-4 py-2 border border-theme-border shadow-inner">
                                        <button onClick={() => updateQuantity(idx, -1)} className="text-theme-text/50 hover:text-theme-gold font-bold px-2 text-xl transition-colors">-</button>
                                        <span className="font-bold w-6 text-center text-white/90">{item.quantity || 1}</span>
                                        <button onClick={() => updateQuantity(idx, 1)} className="text-theme-text/50 hover:text-theme-gold font-bold px-2 text-xl transition-colors">+</button>
                                    </div>
                                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 p-3 ml-2 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all duration-300">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                            {/* Delivery Details */}
                            <div className="mt-12">
                                <h3 className="text-2xl font-heading font-bold mb-6">Delivery Details</h3>
                                <div className="glass-panel p-8 rounded-[2rem] space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-theme-text/70 mb-2 uppercase tracking-wide">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-gold/50" />
                                            <input 
                                                type="tel" 
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Enter your phone number" 
                                                className="input-field !pl-12 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-theme-text/70 mb-2 uppercase tracking-wide">Delivery Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-5 h-5 text-theme-gold/50" />
                                            <textarea 
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                placeholder="Enter your full delivery address" 
                                                className="input-field !pl-12 w-full min-h-[100px] py-4"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-theme-text/70 mb-2 uppercase tracking-wide flex justify-between">
                                            Pin Exact Location
                                            {deliveryCoordinates && <span className="text-green-400 text-xs flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Location Saved</span>}
                                        </label>
                                        <MapPicker onLocationSelect={(lat, lng) => setDeliveryCoordinates({lat, lng})} />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Payment Methods */}
                            <div className="mt-12">
                                <h3 className="text-2xl font-heading font-bold mb-6">Payment Method</h3>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <button 
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`p-6 rounded-[2rem] border transition-all duration-500 text-left flex items-center gap-5 relative overflow-hidden group ${paymentMethod === 'COD' ? 'border-theme-gold bg-theme-gold/5 shadow-[0_0_20px_rgba(212,184,134,0.15)]' : 'border-theme-border bg-theme-surface hover:border-theme-border-highlight'}`}
                                    >
                                        {paymentMethod === 'COD' && <div className="absolute inset-0 bg-gradient-to-r from-theme-gold/10 to-transparent pointer-events-none"></div>}
                                        <Banknote className={`w-8 h-8 z-10 transition-colors ${paymentMethod === 'COD' ? 'text-theme-gold' : 'text-theme-text/50 group-hover:text-theme-gold/70'}`} />
                                        <div className="z-10">
                                            <div className="font-bold text-lg text-white/90">Cash on Delivery</div>
                                            <div className="text-sm text-theme-text/50">Pay at your doorstep</div>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('UPI')}
                                        className={`p-6 rounded-[2rem] border transition-all duration-500 text-left flex items-center gap-5 relative overflow-hidden group ${paymentMethod === 'UPI' ? 'border-theme-gold bg-theme-gold/5 shadow-[0_0_20px_rgba(212,184,134,0.15)]' : 'border-theme-border bg-theme-surface hover:border-theme-border-highlight'}`}
                                    >
                                        {paymentMethod === 'UPI' && <div className="absolute inset-0 bg-gradient-to-r from-theme-gold/10 to-transparent pointer-events-none"></div>}
                                        <CreditCard className={`w-8 h-8 z-10 transition-colors ${paymentMethod === 'UPI' ? 'text-theme-gold' : 'text-theme-text/50 group-hover:text-theme-gold/70'}`} />
                                        <div className="z-10">
                                            <div className="font-bold text-lg text-white/90">UPI / Card</div>
                                            <div className="text-sm text-theme-text/50">Pay securely online</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Summary */}
                        <div>
                            <div className="glass-panel p-8 rounded-[2rem] sticky top-28 relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-theme-gold/5 rounded-full blur-[50px] pointer-events-none"></div>
                                <h3 className="text-2xl font-heading font-bold mb-8 text-white/90">Order Summary</h3>
                                <div className="space-y-5 text-theme-text/70 mb-8 font-medium">
                                    <div className="flex justify-between items-center">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-white/90">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Tax (5%)</span>
                                        <span className="font-bold text-white/90">₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Delivery</span>
                                        <span className="font-bold text-white/90">₹{delivery.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Promo Code System */}
                                    <div className="mt-4 pt-4 border-t border-theme-border/50">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                                placeholder="Enter Promo Code"
                                                disabled={!!appliedPromo || isValidatingPromo}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm uppercase placeholder-theme-text/40 focus:border-theme-gold focus:outline-none disabled:opacity-50"
                                            />
                                            {appliedPromo ? (
                                                <button 
                                                    onClick={() => { setAppliedPromo(null); setPromoCode(''); }}
                                                    className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={handleApplyPromo}
                                                    disabled={isValidatingPromo || !promoCode.trim()}
                                                    className="px-4 py-2 bg-theme-gold/10 text-theme-gold border border-theme-gold/30 rounded-xl text-sm font-bold hover:bg-theme-gold/20 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                                                >
                                                    {isValidatingPromo ? <div className="w-4 h-4 border-2 border-theme-gold border-t-transparent rounded-full animate-spin"></div> : 'Apply'}
                                                </button>
                                            )}
                                        </div>
                                        {promoError && <div className="text-red-400 text-xs mt-2 font-bold">{promoError}</div>}
                                    </div>
                                    
                                    {/* FeastPoints Toggle */}
                                    {availablePoints > 0 && (
                                        <div className="flex items-center justify-between mt-4 p-4 rounded-xl border border-theme-gold/30 bg-theme-gold/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-theme-gold/20 flex items-center justify-center">
                                                    <Wallet className="w-5 h-5 text-theme-gold" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">Use FeastPoints</div>
                                                    <div className="text-xs text-theme-gold/80">{availablePoints} points available</div>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => setUsePoints(!usePoints)}
                                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${usePoints ? 'bg-theme-gold' : 'bg-white/10'}`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${usePoints ? 'translate-x-6' : 'translate-x-1'}`}></div>
                                            </button>
                                        </div>
                                    )}

                                    {usePoints && pointsDiscount > 0 && (
                                        <div className="flex justify-between items-center text-theme-gold mt-2">
                                            <span>Points Applied</span>
                                            <span className="font-bold">-₹{pointsDiscount.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="h-px bg-theme-border/50 my-6"></div>
                                    <div className="flex justify-between items-end text-white/90">
                                        <span className="font-bold text-xl">Total</span>
                                        <span className="text-4xl font-heading font-extrabold text-gradient">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm text-green-400 bg-green-500/10 p-4 rounded-xl border border-green-500/20 mb-8 backdrop-blur-md">
                                    <ShieldCheck className="w-5 h-5" /> 100% Secure Checkout process
                                </div>
                                
                                {user ? (
                                    <button 
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Processing...' : (
                                            <>Place Order <ArrowRight className="w-5 h-5" /></>
                                        )}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => router.push('/')}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        Log In to Checkout <ArrowRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Recommendations */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <Recommendations />
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-theme-bg border border-theme-gold/30 p-10 rounded-[3rem] max-w-md w-full text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-theme-gold/10 to-transparent pointer-events-none" />
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-heading font-extrabold mb-2 text-white">Order Placed!</h2>
                        <p className="text-theme-text/70 mb-8">
                            Your delicious meal is being prepared and will be delivered to you shortly.
                        </p>
                        <button 
                            onClick={() => router.push('/profile')}
                            className="btn-primary w-full shadow-[0_0_20px_rgba(212,184,134,0.3)]"
                        >
                            View My Orders
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Group Order Info Modal */}
            {showGroupInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-theme-bg border border-theme-gold/30 p-8 md:p-10 rounded-[3rem] max-w-lg w-full relative overflow-hidden"
                    >
                        <button onClick={() => setShowGroupInfo(false)} className="absolute top-6 right-6 text-white/50 hover:text-white">
                            ✕
                        </button>
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-theme-gold/5 to-transparent pointer-events-none" />
                        
                        <div className="w-16 h-16 bg-theme-gold/20 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-8 h-8 text-theme-gold" />
                        </div>
                        <h2 className="text-3xl font-heading font-extrabold mb-4 text-white">How Group Orders Work</h2>
                        <p className="text-theme-text/70 mb-8">
                            Ordering for the whole team or a party? It's simple!
                        </p>

                        <div className="space-y-6 mb-10">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-theme-gold/20 flex items-center justify-center font-bold text-theme-gold shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Copy the Link</h4>
                                    <p className="text-sm text-theme-text/60">Generate a unique invite link for your cart.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-theme-gold/20 flex items-center justify-center font-bold text-theme-gold shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Share with Friends</h4>
                                    <p className="text-sm text-theme-text/60">Send the link via WhatsApp, Slack, or SMS.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded-full bg-theme-gold/20 flex items-center justify-center font-bold text-theme-gold shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">Order Together</h4>
                                    <p className="text-sm text-theme-text/60">Their chosen items instantly sync to your cart for one easy checkout.</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.origin + '/cart?group=' + user?._id);
                                toast.success('Group Order Link copied to clipboard!');
                                setShowGroupInfo(false);
                            }}
                            className="btn-primary w-full shadow-[0_0_20px_rgba(212,184,134,0.3)] flex justify-center gap-2"
                        >
                            <LinkIcon className="w-5 h-5" /> Copy Invite Link
                        </button>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
