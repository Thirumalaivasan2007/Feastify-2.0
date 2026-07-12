'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Star, TrendingUp, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SocialFeedPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/social');
                const data = await res.json();
                
                // Map DB Reviews to Social Feed format
                const mappedPosts = data.map((review: any, idx: number) => ({
                    id: review._id || idx,
                    user: review.userName || 'Anonymous',
                    tier: review.sentimentScore > 0.8 ? 'Black' : 'Platinum', // Mock tier based on sentiment
                    avatar: (review.userName || 'A').charAt(0).toUpperCase(),
                    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80', // In a real app, join with Food table to get food image
                    food: 'Premium Item', // In a real app, join with Food table
                    rating: review.rating,
                    comment: review.comment,
                    likes: Math.floor(review.sentimentScore * 100),
                    time: new Date(review.createdAt).toLocaleDateString()
                }));
                
                setPosts(mappedPosts);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12 relative overflow-hidden">
            {/* Background Ambient Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-theme-gold/5 blur-[120px] pointer-events-none" />
            <Navbar />
            
            <div className="max-w-3xl mx-auto px-6 relative z-10">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-2">Feastify <span className="text-gradient">Social</span></h1>
                        <p className="text-theme-text/60">Discover trending orders and VIP reviews.</p>
                    </div>
                    <div className="bg-theme-gold/10 px-4 py-2 rounded-full border border-theme-gold/20 flex items-center gap-2 text-theme-gold text-sm font-bold">
                        <TrendingUp className="w-4 h-4" /> Trending
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                    <div className="space-y-8">
                        {posts.map((post, idx) => (
                            <motion.div 
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="glass-panel rounded-[2rem] overflow-hidden group"
                            >
                                <div className="p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-theme-surface flex items-center justify-center font-bold text-xl text-theme-gold border border-theme-gold/30 shadow-[0_0_15px_rgba(212,184,134,0.2)]">
                                        {post.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{post.user}</h3>
                                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${post.tier === 'Black' ? 'bg-black text-white border-white/20' : 'bg-gray-200 text-black border-gray-400'}`}>
                                                {post.tier} VIP
                                            </span>
                                        </div>
                                        <p className="text-xs text-theme-text/50">{post.time}</p>
                                    </div>
                                </div>
                                
                                <div className="px-6 pb-4">
                                    <p className="text-white/80 leading-relaxed mb-4">"{post.comment}"</p>
                                    <div className="bg-theme-surface/50 border border-theme-border/50 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-theme-surface transition-colors">
                                        <img src={post.image} alt={post.food} className="w-16 h-16 rounded-lg object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white">{post.food}</h4>
                                            <div className="flex text-theme-gold mt-1">
                                                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-theme-gold text-black font-bold text-xs rounded-full">Order</button>
                                    </div>
                                </div>
                                
                                <div className="px-6 py-4 border-t border-theme-border/30 flex items-center gap-6">
                                    <button className="flex items-center gap-2 text-theme-text/60 hover:text-red-400 transition-colors text-sm font-bold">
                                        <Heart className="w-5 h-5" /> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-2 text-theme-text/60 hover:text-white transition-colors text-sm font-bold">
                                        <MessageCircle className="w-5 h-5" /> Comment
                                    </button>
                                    <button className="flex items-center gap-2 text-theme-text/60 hover:text-theme-gold transition-colors text-sm font-bold ml-auto">
                                        <Share2 className="w-5 h-5" /> Share
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
