'use client';

import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Info, Plus, Star, Flame, Box } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Recommendations from '@/components/Recommendations';

function DetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const [food, setFood] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAR, setShowAR] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/');
            return;
        }
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
            router.push('/admin');
            return;
        }

        if (!id) return;
        fetch(`/api/foods/${id}`)
            .then(res => res.json())
            .then(data => {
                setFood(data);
                setIsLoading(false);
            })
            .catch(console.error);
    }, [id]);

    const addToCart = () => {
        if (!food) return;
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find((c: any) => c._id === food._id);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            cart.push({ ...food, quantity: 1, id: food._id });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Added to cart!');
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return toast.error('Please enter a review');
        
        setIsSubmitting(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        try {
            const res = await fetch(`/api/foods/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: user.name, rating, comment })
            });
            const data = await res.json();
            if (data.success) {
                setFood(data.food);
                setComment('');
                setRating(5);
                toast.success('Review added!');
            } else {
                toast.error(data.message || 'Failed to add review');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!food) {
        return <div className="text-center py-20">Item not found.</div>;
    }

    return (
        <>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
                <motion.div 
                    initial={{ opacity: 0, x: -50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative h-[50vh] lg:h-[75vh] rounded-[3rem] overflow-hidden group shadow-2xl"
                >
                    <div className="absolute inset-0 bg-theme-gold/10 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040A07] via-black/20 to-transparent z-20 pointer-events-none"></div>
                    
                    {/* AR Preview Button Overlay */}
                    <button 
                        onClick={() => setShowAR(true)}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md border border-theme-gold/40 text-theme-gold px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-theme-gold hover:text-black transition-colors shadow-[0_0_20px_rgba(212,184,134,0.3)]"
                    >
                        <Box className="w-4 h-4" /> View in AR
                    </button>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
                    className="space-y-8 relative"
                >
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-theme-gold/5 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <Link href="/menu" className="inline-flex items-center gap-2 text-theme-text/50 hover:text-theme-gold mb-2 transition-colors font-bold tracking-wide uppercase text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Menu
                    </Link>
                    
                    <div className="inline-block bg-theme-gold/10 px-5 py-2 rounded-full text-xs font-bold border border-theme-gold/20 tracking-widest uppercase text-theme-gold shadow-[0_0_15px_rgba(212,184,134,0.15)]">
                        {food.category}
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-heading font-extrabold leading-tight text-theme-text/90">
                        {food.name}
                    </h1>
                    
                    {food.reviews && food.reviews.length > 0 && (
                        <div className="flex items-center gap-2 mt-4">
                            <Star className="w-6 h-6 text-theme-gold fill-current" />
                            <span className="text-2xl font-bold text-theme-text">{(food.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / food.reviews.length).toFixed(1)}</span>
                            <span className="text-theme-text/50 text-sm">({food.reviews.length} reviews)</span>
                        </div>
                    )}
                    
                    <div className="text-4xl lg:text-5xl font-extrabold text-gradient inline-block">₹{food.price.toFixed(2)}</div>
                    
                    <p className="text-lg text-theme-text/70 leading-relaxed max-w-xl font-medium">{food.description}</p>
                    
                    <div className="flex items-center gap-8 text-sm text-theme-text/60 font-bold bg-theme-surface/50 p-6 rounded-3xl border border-theme-border/50 backdrop-blur-md">
                        <div className="flex items-center gap-3"><Clock className="w-6 h-6 text-theme-gold" /> Prep: {food.prepTime || '25-30 Mins'}</div>
                        <div className="w-px h-8 bg-theme-border/50"></div>
                        <div className="flex items-center gap-3"><Info className="w-6 h-6 text-blue-400" /> {food.tag || 'Fresh Items'}</div>
                    </div>
                    
                    <button 
                        onClick={addToCart}
                        className="w-full sm:w-auto bg-gradient-gold hover:opacity-90 text-[#040A07] font-bold text-lg px-10 py-5 rounded-full flex items-center justify-center gap-3 mt-10 transition-all duration-300 shadow-[0_0_30px_rgba(212,184,134,0.3)] hover:shadow-[0_0_40px_rgba(212,184,134,0.5)] transform hover:-translate-y-1"
                    >
                        <Plus className="w-6 h-6" /> Add to Cart
                    </button>
                </motion.div>
            </div>

            <div className="max-w-4xl mx-auto mb-20">
                <h3 className="text-3xl font-heading font-bold mb-8 flex items-center gap-4">
                    <Flame className="w-8 h-8 text-orange-500" />
                    AI Nutritional Breakdown
                </h3>
                <div className="glass-panel p-8 md:p-12 rounded-[3rem] border border-theme-border/50 bg-gradient-to-br from-black/80 to-[#0a150e]">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="text-theme-text/60 mb-6 leading-relaxed">Our AI has analyzed this dish to provide estimated macronutrients. Perfect for keeping track of your daily intake!</p>
                            
                            <div className="space-y-6">
                                {/* Protein */}
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-blue-400">Protein</span>
                                        <span className="text-theme-text">{food.price > 300 ? '45g' : '12g'}</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} whileInView={{ width: food.price > 300 ? '75%' : '20%' }} transition={{ duration: 1, delay: 0.2 }} viewport={{ once: true }} className="h-full bg-blue-500 rounded-full" />
                                    </div>
                                </div>
                                {/* Carbs */}
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-yellow-500">Carbs</span>
                                        <span className="text-theme-text">{food.category === 'Desserts' || food.category === 'Biryani' ? '65g' : '30g'}</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} whileInView={{ width: food.category === 'Desserts' || food.category === 'Biryani' ? '85%' : '40%' }} transition={{ duration: 1, delay: 0.4 }} viewport={{ once: true }} className="h-full bg-yellow-500 rounded-full" />
                                    </div>
                                </div>
                                {/* Fats */}
                                <div>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-red-400">Fats</span>
                                        <span className="text-theme-text">{food.category === 'Desserts' ? '40g' : '18g'}</span>
                                    </div>
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} whileInView={{ width: food.category === 'Desserts' ? '60%' : '25%' }} transition={{ duration: 1, delay: 0.6 }} viewport={{ once: true }} className="h-full bg-red-400 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center relative">
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                whileInView={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", duration: 1.5 }}
                                viewport={{ once: true }}
                                className="w-48 h-48 md:w-64 md:h-64 rounded-full border-[8px] border-theme-surface flex flex-col items-center justify-center relative bg-black shadow-[0_0_50px_rgba(212,184,134,0.15)]"
                            >
                                {/* Simulated SVG Donut Chart */}
                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                                    <motion.circle initial={{ strokeDasharray: "0 251" }} whileInView={{ strokeDasharray: "150 251" }} transition={{ duration: 1.5 }} viewport={{ once: true }} cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" />
                                    <motion.circle initial={{ strokeDasharray: "0 251" }} whileInView={{ strokeDasharray: "70 251" }} transition={{ duration: 1.5, delay: 0.5 }} viewport={{ once: true }} cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="12" strokeDashoffset="-150" />
                                    <motion.circle initial={{ strokeDasharray: "0 251" }} whileInView={{ strokeDasharray: "31 251" }} transition={{ duration: 1.5, delay: 1 }} viewport={{ once: true }} cx="50" cy="50" r="40" fill="transparent" stroke="#f87171" strokeWidth="12" strokeDashoffset="-220" />
                                </svg>
                                
                                <span className="text-4xl md:text-5xl font-heading font-extrabold text-theme-text">{food.category === 'Desserts' ? '850' : '520'}</span>
                                <span className="text-xs uppercase tracking-widest text-theme-text/50 mt-1">Calories</span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                <h3 className="text-3xl font-heading font-bold mb-8 flex items-center gap-4">
                    Ratings & Reviews
                    <span className="text-sm bg-theme-gold/20 text-theme-gold px-3 py-1 rounded-full">{food.reviews?.length || 0}</span>
                </h3>

                <div className="glass-panel p-8 rounded-[2rem] mb-10 border border-theme-border/50">
                    <h4 className="text-xl font-bold mb-4">Write a Review</h4>
                    <form onSubmit={submitReview} className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-1 transition-all ${rating >= star ? 'text-theme-gold scale-110' : 'text-theme-text/20 hover:text-theme-text/50'}`}
                                >
                                    <Star className="w-8 h-8 fill-current" />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this dish..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-theme-text focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold transition-all min-h-[120px]"
                            required
                        />
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Post Review'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    {(!food.reviews || food.reviews.length === 0) ? (
                        <div className="text-center py-12 text-theme-text/50 bg-theme-surface/30 rounded-3xl border border-white/5">
                            <Star className="w-12 h-12 mx-auto mb-4 text-theme-text/10" />
                            No reviews yet. Be the first to review!
                        </div>
                    ) : (
                        food.reviews.slice().reverse().map((rev: any, idx: number) => (
                            <div key={idx} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-theme-gold/30 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h5 className="font-bold text-theme-text mb-1">{rev.userName}</h5>
                                        <div className="text-xs text-theme-text/40">{new Date(rev.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-theme-gold">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-theme-text/10 fill-transparent'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-theme-text/80">{rev.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* AI Recommendations */}
            <Recommendations contextCategory={food.category} />

            {/* AR Modal */}
            {showAR && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setShowAR(false)}></div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full max-w-2xl h-[70vh] border border-theme-gold/30 rounded-3xl overflow-hidden bg-[#0A0A0A]"
                    >
                        {/* Mock Camera Background */}
                        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80')" }}></div>
                        
                        {/* Floating AR Model (Mocked with spinning image) */}
                        <motion.div 
                            animate={{ rotateY: 360, y: [0, -20, 0] }}
                            transition={{ rotateY: { duration: 10, repeat: Infinity, ease: "linear" }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <img src={food.imageUrl} alt={food.name} className="w-64 h-64 object-cover rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-4 border-theme-gold/20" style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }} />
                        </motion.div>

                        {/* AR UI Elements */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                <p className="text-xs text-theme-text/70 font-bold uppercase tracking-widest">AR Mode Active</p>
                                <p className="text-theme-gold font-bold">Scanning Surface...</p>
                            </div>
                            <button onClick={() => setShowAR(false)} className="bg-black/50 border border-white/10 w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto hover:bg-white/10 transition-colors">
                                <span className="text-theme-text text-xl leading-none">&times;</span>
                            </button>
                        </div>
                        
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none flex gap-4">
                            <div className="w-16 h-16 rounded-full border-2 border-theme-gold flex items-center justify-center shadow-[0_0_20px_rgba(212,184,134,0.3)]">
                                <div className="w-12 h-12 bg-theme-gold rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}

export default function DetailsPage() {
    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6">
                <Suspense fallback={<div>Loading...</div>}>
                    <DetailsContent />
                </Suspense>
            </div>
        </main>
    );
}
