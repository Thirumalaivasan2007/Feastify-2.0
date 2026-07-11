import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Star } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function Recommendations({ contextCategory = null }: { contextCategory?: string | null }) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch('/api/foods');
                const foods = await res.json();
                
                // Smart Logic AI: Recommend complementary items or top-rated items in other categories
                let recs = [];
                if (contextCategory) {
                    recs = foods.filter((f: any) => f.category !== contextCategory);
                    recs = recs.sort(() => 0.5 - Math.random()).slice(0, 3);
                } else {
                    recs = foods.sort(() => 0.5 - Math.random()).slice(0, 3);
                }
                
                setRecommendations(recs);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecommendations();
    }, [contextCategory]);

    const handleAdd = (food: any) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) => item._id === food._id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ ...food, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        toast.success(`Added ${food.name} to cart`);
    };

    if (isLoading || recommendations.length === 0) return null;

    return (
        <div className="my-12">
            <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-2 text-theme-gold">
                <Sparkles className="w-5 h-5" />
                You Might Also Like
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommendations.map((food, idx) => {
                    const avgRating = food.reviews?.length 
                        ? (food.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / food.reviews.length).toFixed(1)
                        : null;

                    return (
                        <motion.div 
                            key={food._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel p-3 rounded-2xl flex items-center gap-4 border border-theme-border/50 group"
                        >
                            <Link href={`/details?id=${food._id}`} className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </Link>
                            
                            <div className="flex-1">
                                <Link href={`/details?id=${food._id}`}>
                                    <h4 className="font-bold text-white/90 text-sm line-clamp-1 group-hover:text-theme-gold transition-colors">{food.name}</h4>
                                </Link>
                                <div className="text-xs text-theme-gold font-bold mt-1">₹{food.price.toFixed(2)}</div>
                                {avgRating && (
                                    <div className="text-[10px] text-white/50 flex items-center gap-1 mt-1">
                                        <Star className="w-3 h-3 text-theme-gold fill-theme-gold" /> {avgRating}
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => handleAdd(food)}
                                className="p-2 bg-theme-gold/10 text-theme-gold hover:bg-theme-gold hover:text-black rounded-lg transition-colors border border-theme-gold/30"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
