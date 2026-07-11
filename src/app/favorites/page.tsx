'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/');
            return;
        }
        const u = JSON.parse(userStr);
        setUser(u);
        fetchFavorites(u.email);
    }, [router]);

    const fetchFavorites = async (email: string) => {
        try {
            const res = await fetch(`/api/favorites?email=${email}`);
            const data = await res.json();
            if (data.success) {
                setFavorites(data.favorites);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load favorites');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFavorite = async (foodId: string) => {
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, foodId })
            });
            const data = await res.json();
            if (data.success && !data.isFavorite) {
                setFavorites(favorites.filter(f => f._id !== foodId));
                toast.success('Removed from favorites');
            }
        } catch (err) {
            toast.error('Failed to update favorites');
        }
    };

    if (isLoading) return <div className="min-h-screen bg-theme-bg flex items-center justify-center"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-4xl font-heading font-extrabold mb-8 flex items-center gap-4">
                    <Heart className="w-10 h-10 text-theme-gold fill-theme-gold" />
                    My <span className="text-gradient">Favorites</span>
                </h1>

                {favorites.length === 0 ? (
                    <div className="text-center py-20 glass-panel rounded-[2rem] border border-theme-border/50">
                        <Heart className="w-16 h-16 mx-auto mb-4 text-white/10" />
                        <h2 className="text-2xl font-bold text-white/70 mb-4">No favorites yet</h2>
                        <p className="text-theme-text/50 mb-8">You haven't saved any items to your wishlist.</p>
                        <Link href="/menu" className="btn-primary">
                            Explore Menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favorites.map((food, idx) => (
                            <motion.div 
                                key={food._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card rounded-[2rem] overflow-hidden group border border-theme-border/50 hover:border-theme-gold/50 transition-all duration-500 hover:-translate-y-2 relative"
                            >
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeFavorite(food._id);
                                    }}
                                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#040A07]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all text-theme-gold"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#040A07] to-transparent z-10"></div>
                                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="p-6 relative z-20 -mt-8">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold font-heading text-white/90">{food.name}</h3>
                                    </div>
                                    <p className="text-sm text-theme-text/60 line-clamp-2 mb-4">{food.description}</p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="text-xl font-extrabold text-theme-gold">₹{food.price.toFixed(2)}</div>
                                        <Link href={`/details?id=${food._id}`} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-theme-text/80 group-hover:bg-theme-gold group-hover:text-[#040A07] group-hover:border-theme-gold transition-all duration-300">
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
