'use client';

import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Search, Plus, ArrowRight, ArrowLeft, TicketPercent, ShoppingCart, Filter, X, Sparkles, Heart, Star, Mic, AlertTriangle, Leaf } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function MenuContent() {
    const [foods, setFoods] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [cartTotal, setCartTotal] = useState(0);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCategory = searchParams?.get('category');
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error("Voice search is not supported in your browser.");
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            toast.success("Listening...", { id: 'voice' });
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            toast.success(`Heard: "${transcript}". AI is analyzing...`, { id: 'voice' });
            
            try {
                const res = await fetch('/api/ai/voice-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transcript })
                });
                const data = await res.json();
                
                if (data.success && data.items.length > 0) {
                    toast.success(`AI added ${data.items.length} items to your cart!`, { id: 'voice' });
                    
                    const groupId = localStorage.getItem('activeGroupId');
                    
                    if (groupId) {
                        // Add each item to group cart
                        for (const item of data.items) {
                            const food = foods.find(f => f._id === item.foodId);
                            if (food) {
                                await fetch('/api/group-cart', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        groupId,
                                        action: 'add',
                                        item: { 
                                            foodId: food._id, 
                                            name: food.name, 
                                            price: food.price, 
                                            quantity: item.quantity || 1,
                                            imageUrl: food.imageUrl 
                                        }
                                    })
                                });
                            }
                        }
                    } else {
                        // Add each item to local cart
                        let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                        data.items.forEach((item: any) => {
                            const food = foods.find(f => f._id === item.foodId);
                            if (food) {
                                const existing = localCart.find((c: any) => c._id === food._id);
                                if (existing) {
                                    existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
                                } else {
                                    localCart.push({ ...food, quantity: item.quantity || 1, id: food._id });
                                }
                            }
                        });
                        localStorage.setItem('cart', JSON.stringify(localCart));
                        window.dispatchEvent(new Event('cartUpdated'));
                    }
                } else {
                    toast.error("AI couldn't find matching items. Try being more specific.", { id: 'voice' });
                }
            } catch (err) {
                toast.error("Failed to process voice order with AI.", { id: 'voice' });
            }
        };

        recognition.onerror = (event: any) => {
            console.warn("Speech recognition issue:", event.error);
            if (event.error === 'not-allowed' || event.error === 'audio-capture') {
                toast.error("Microphone access denied or not found.", { id: 'voice' });
            } else {
                toast.error("Failed to recognize speech.", { id: 'voice' });
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    useEffect(() => {
        // Auth check
        const userStr = localStorage.getItem('user');
        let parsedUser = null;
        if (userStr) {
            parsedUser = JSON.parse(userStr);
            if (parsedUser.role === 'admin' || parsedUser.role === 'driver') {
                router.push(parsedUser.role === 'admin' ? '/admin' : '/driver');
                return;
            }
            setUser(parsedUser);
        }

        const fetchData = async () => {
            try {
                const [foodRes, catRes] = await Promise.all([
                    fetch('/api/foods'),
                    fetch('/api/categories')
                ]);
                const foodData = await foodRes.json();
                const catData = await catRes.json();
                setFoods(foodData);
                setCategories(catData);
                
                // Fetch favorites
                if (parsedUser?.email) {
                    const favRes = await fetch(`/api/favorites?email=${parsedUser.email}`);
                    const favData = await favRes.json();
                    if (favData.success) {
                        setFavorites(favData.favorites.map((f: any) => f._id || f));
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        const updateCartMeta = () => {
            const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
            let count = 0;
            let total = 0;
            cartData.forEach((item: any) => {
                count += (item.quantity || 1);
                total += (item.price * (item.quantity || 1));
            });
            setCartCount(count);
            setCartTotal(total);
        };
        updateCartMeta();
        window.addEventListener('cartUpdated', updateCartMeta);
        
        return () => window.removeEventListener('cartUpdated', updateCartMeta);
    }, [router]);

    const addToCart = async (food: any) => {
        const groupId = localStorage.getItem('activeGroupId');
        if (groupId) {
            await fetch('/api/group-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId,
                    action: 'add',
                    item: { 
                        foodId: food._id, 
                        name: food.name, 
                        price: food.price, 
                        quantity: 1,
                        imageUrl: food.imageUrl 
                    }
                })
            });
            toast.success('Added to Group Cart');
        } else {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existing = cart.find((c: any) => c._id === food._id);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.push({ ...food, quantity: 1, id: food._id });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            window.dispatchEvent(new Event('cartUpdated'));
            toast.success('Added to Cart');
        }
    };

    const toggleFavorite = async (foodId: string, e: any) => {
        e.stopPropagation();
        if (!user) {
            toast.error('Please log in to add favorites');
            return;
        }
        
        // Optimistic UI update
        const isCurrentlyFavorite = favorites.includes(foodId);
        if (isCurrentlyFavorite) {
            setFavorites(favorites.filter(id => id !== foodId));
        } else {
            setFavorites([...favorites, foodId]);
        }
        
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, foodId })
            });
            const data = await res.json();
            if (!data.success) {
                // Revert on failure
                if (isCurrentlyFavorite) {
                    setFavorites([...favorites, foodId]);
                } else {
                    setFavorites(favorites.filter(id => id !== foodId));
                }
                toast.error('Failed to update favorites');
            }
        } catch (err) {
            // Revert on failure
            if (isCurrentlyFavorite) {
                setFavorites([...favorites, foodId]);
            } else {
                setFavorites(favorites.filter(id => id !== foodId));
            }
        }
    };

    const [showFilters, setShowFilters] = useState(false);
    const [maxPrice, setMaxPrice] = useState(2000);
    const [dietaryFilter, setDietaryFilter] = useState('All');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    
    // Simulate AI Recommendations (Top 4 highest priced or specific items)
    const recommendedFoods = [...foods].sort((a, b) => b.price - a.price).slice(0, 4);

    const applyFilters = (foodList: any[]) => {
        return foodList.filter(food => {
            const matchesSearch = food.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            const matchesPrice = food.price <= maxPrice;
            
            // Check real dietary tags if they exist, otherwise fallback to name heuristics for older data
            const matchesDiet = dietaryFilter === 'All' || 
                (food.dietaryTags && food.dietaryTags.includes(dietaryFilter)) ||
                (dietaryFilter === 'Veg' && !food.name.toLowerCase().includes('chicken') && !food.name.toLowerCase().includes('mutton') && !food.name.toLowerCase().includes('fish')) ||
                (dietaryFilter === 'Non-Veg' && (food.name.toLowerCase().includes('chicken') || food.name.toLowerCase().includes('mutton') || food.name.toLowerCase().includes('fish'))) ||
                (dietaryFilter === 'High Protein' && food.price > 300);
                
            return matchesSearch && matchesPrice && matchesDiet;
        });
    };

    const groupedFoods = categories.map(cat => {
        const items = applyFilters(foods.filter(food => food.category === cat.name));
        return { name: cat.name, items };
    }).filter(cat => cat.items.length > 0);

    const categoryGridItems = selectedCategory 
        ? applyFilters(foods.filter(f => f.category === selectedCategory))
        : [];

    return (
        <main className="min-h-screen bg-transparent text-theme-text pt-24 pb-12 overflow-x-hidden">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-6">
                {/* Search Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-heading md:text-5xl font-heading font-light mb-2 text-gradient">Explore Our Menu</h1>
                        <p className="text-theme-text/60 font-medium">Discover culinary masterpieces crafted for you.</p>
                    </div>
                    
                    <div className="flex w-full md:w-auto items-center gap-3">
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-gold/50 group-focus-within:text-theme-gold transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search for Biryani, Pizza..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field !pl-14 !pr-14 py-3"
                            />
                            <button 
                                onClick={startListening}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${isListening ? 'bg-theme-gold text-black animate-pulse' : 'text-theme-text/40 hover:text-theme-gold hover:bg-theme-gold/10'}`}
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>
                        <button 
                            onClick={() => setShowFilters(true)}
                            className="bg-theme-surface border border-theme-border p-3.5 rounded-[1.25rem] hover:border-theme-gold/50 transition-colors relative"
                        >
                            <Filter className="w-5 h-5 text-theme-gold" />
                            {(dietaryFilter !== 'All' || maxPrice < 2000) && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#040A07]"></span>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Hero Promo Banner (only show on main menu) */}
                {!searchQuery && !selectedCategory && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full mb-12 rounded-none overflow-hidden relative shadow-2xl"
                    >
                        <div className="bg-[#040A07] border border-theme-gold/30 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-theme-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-theme-gold/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
                            
                            <div className="flex items-center gap-6 z-10 mb-6 md:mb-0">
                                <div className="p-4 bg-theme-gold/10 backdrop-blur-md rounded-none hidden md:block border border-theme-gold/20">
                                    <TicketPercent className="w-12 h-12 text-theme-gold" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-heading md:text-5xl font-heading font-light text-white mb-2 drop-shadow-md">Exclusive Collection</h2>
                                    <p className="text-xl text-theme-gold font-medium italic">Flat 10% Off up to ₹100 on your first experience</p>
                                </div>
                            </div>
                            
                            <div className="z-10 w-full md:w-auto">
                                <button className="w-full md:w-auto px-8 py-4 text-xs font-semibold uppercase tracking-widest text-[#040A07] bg-theme-gold hover:bg-[#d4af37] transition-all duration-300 shadow-md font-sans rounded-none gold-shine">
                                    Claim Privilege
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* AI Recommendations */}
                {!searchQuery && !selectedCategory && recommendedFoods.length > 0 && !isLoading && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles className="w-6 h-6 text-theme-gold" />
                            <h2 className="text-2xl font-heading font-light text-white">Curated For You</h2>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar">
                            {recommendedFoods.map((food, idx) => (
                                <motion.div 
                                    key={food._id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="min-w-[300px] md:min-w-[350px] snap-center shrink-0 glass-panel p-4 rounded-none border border-theme-border/50 hover:border-theme-gold/30 group relative overflow-hidden cursor-pointer"
                                    onClick={() => router.push(`/menu/details?id=${food._id}`)}
                                >
                                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-theme-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                    <div className="aspect-video w-full rounded-none bg-black/40 mb-4 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'})` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4">
                                            <span className="bg-theme-gold text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Featured</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="text-xl font-bold text-white mb-1 truncate">{food.name}</h3>
                                        <p className="text-sm text-theme-text/60 line-clamp-1 mb-4">{food.description}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="text-xl font-heading font-light text-theme-gold">₹{food.price}</div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); addToCart(food); toast.success('Added to cart!'); }}
                                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-theme-gold hover:text-black transition-all"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : selectedCategory ? (
                    /* ====== CATEGORY GRID VIEW ====== */
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <button 
                                onClick={() => router.push('/menu')}
                                className="bg-theme-surface hover:bg-gradient-gold text-theme-text hover:text-[#040A07] p-3 rounded-full transition-all duration-300 border border-theme-border shadow-lg"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h2 className="text-3xl font-heading font-bold font-heading text-white">{selectedCategory}</h2>
                                <p className="text-theme-text/60 text-sm mt-1">{categoryGridItems.length} items available</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categoryGridItems.map((food: any, idx: number) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={food._id}
                                    className="glass-card rounded-none overflow-hidden group flex flex-col"
                                >
                                    <div className="relative h-48 overflow-hidden bg-theme-surface cursor-pointer" onClick={() => router.push(`/details?id=${food._id}`)}>
                                        <div className="absolute inset-0 bg-theme-gold/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                                        <img 
                                            src={food.imageUrl} 
                                            alt={food.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-theme-gold/30 text-theme-gold z-20 shadow-lg uppercase tracking-wider">
                                            {food.tag || selectedCategory}
                                        </div>
                                        {food.reviews && food.reviews.length > 0 && (
                                            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-none text-xs font-bold border border-white/10 text-white z-20 flex items-center gap-1 shadow-lg">
                                                <Star className="w-3 h-3 text-theme-gold fill-current" />
                                                {(food.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / food.reviews.length).toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-transparent to-[#040A07]/40">
                                        <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-theme-gold transition-colors cursor-pointer line-clamp-1" onClick={() => router.push(`/details?id=${food._id}`)}>
                                            {food.name}
                                        </h3>
                                        {food.dietaryTags && food.dietaryTags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {food.dietaryTags.map((tag: string, i: number) => (
                                                    <span key={i} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1 border bg-theme-gold/5 text-theme-gold border-theme-gold/20">
                                                        <Leaf className="w-2.5 h-2.5" /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {user?.dietaryPreferences?.some((pref: string) => food.name.toLowerCase().includes(pref.toLowerCase())) && (
                                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 mb-2 w-fit">
                                                <AlertTriangle className="w-2.5 h-2.5" /> Allergy Warning
                                            </div>
                                        )}
                                        <p className="text-xs text-theme-text/60 line-clamp-2 mb-4 flex-1 leading-relaxed">{food.description}</p>
                                        
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-xl font-light text-white/90">
                                                <span className="text-theme-gold text-base mr-1">₹</span>
                                                {food.price.toFixed(2)}
                                            </span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); addToCart(food); }}
                                                className="bg-theme-surface hover:bg-gradient-gold text-theme-gold hover:text-[#040A07] p-2.5 rounded-full transition-all duration-300 border border-theme-border hover:border-transparent hover:shadow-[0_0_15px_rgba(212,184,134,0.4)]"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    /* ====== MAIN MENU HORIZONTAL ROWS ====== */
                    <div className="flex flex-col gap-12">
                        {groupedFoods.map((category, catIdx) => (
                            <motion.div 
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: catIdx * 0.1 }}
                                className="w-full"
                            >
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <h2 className="text-2xl md:text-3xl font-bold font-heading text-white/90 tracking-wide">
                                        {category.name}
                                    </h2>
                                    <button 
                                        onClick={() => router.push(`/menu?category=${encodeURIComponent(category.name)}`)}
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg transition-colors group flex items-center gap-2 font-bold text-sm"
                                    >
                                        View All
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                
                                {/* Horizontal Scroll Container */}
                                <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory px-2">
                                    {category.items.map((food: any, idx: number) => (
                                        <motion.div 
                                            key={food._id}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: catIdx * 0.1 + idx * 0.05, duration: 0.5 }}
                                            className="min-w-[280px] max-w-[280px] sm:min-w-[300px] sm:max-w-[300px] snap-start glass-card rounded-none overflow-hidden group flex flex-col flex-shrink-0"
                                        >
                                            <div className="relative h-48 overflow-hidden bg-theme-surface cursor-pointer" onClick={() => router.push(`/details?id=${food._id}`)}>
                                                <div className="absolute inset-0 bg-theme-gold/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
                                                <img 
                                                    src={food.imageUrl} 
                                                    alt={food.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-theme-gold/30 text-theme-gold z-20 shadow-lg uppercase tracking-wider">
                                                    {food.tag || category.name}
                                                </div>
                                                <button 
                                                    onClick={(e) => toggleFavorite(food._id, e)}
                                                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 z-20 hover:scale-110 transition-transform"
                                                >
                                                    <Heart className={`w-4 h-4 ${favorites.includes(food._id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                                </button>
                                                {food.reviews && food.reviews.length > 0 && (
                                                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-none text-xs font-bold border border-white/10 text-white z-20 flex items-center gap-1 shadow-lg">
                                                        <Star className="w-3 h-3 text-theme-gold fill-current" />
                                                        {(food.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / food.reviews.length).toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-5 flex flex-col flex-1 relative bg-gradient-to-b from-transparent to-[#040A07]/40">
                                                <h3 className="text-lg font-heading font-bold mb-2 group-hover:text-theme-gold transition-colors cursor-pointer line-clamp-1" onClick={() => router.push(`/details?id=${food._id}`)}>
                                                    {food.name}
                                                </h3>
                                                {food.dietaryTags && food.dietaryTags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        {food.dietaryTags.map((tag: string, i: number) => (
                                                            <span key={i} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border bg-theme-gold/10 text-green-400 border-theme-gold/20">
                                                                <Leaf className="w-2.5 h-2.5" /> {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {user?.dietaryPreferences?.some((pref: string) => food.name.toLowerCase().includes(pref.toLowerCase())) && (
                                                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mb-2 w-fit">
                                                        <AlertTriangle className="w-2.5 h-2.5" /> Allergy Warning
                                                    </div>
                                                )}
                                                <p className="text-xs text-theme-text/60 line-clamp-2 mb-4 flex-1 leading-relaxed">{food.description}</p>
                                                
                                                <div className="flex justify-between items-center mt-auto">
                                                    <span className="text-xl font-light text-white/90">
                                                        <span className="text-theme-gold text-base mr-1">₹</span>
                                                        {food.price.toFixed(2)}
                                                    </span>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); addToCart(food); }}
                                                        className="bg-theme-surface hover:bg-gradient-gold text-theme-gold hover:text-[#040A07] p-2.5 rounded-full transition-all duration-300 border border-theme-border hover:border-transparent hover:shadow-[0_0_15px_rgba(212,184,134,0.4)]"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                
                {!isLoading && groupedFoods.length === 0 && !selectedCategory && (
                    <div className="text-center py-20 text-white/50">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">No items found.</p>
                    </div>
                )}
                
                {/* Floating Cart Button */}
                {cartCount > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                    >
                        <button 
                            onClick={() => router.push('/cart')}
                            className="bg-theme-gold hover:bg-theme-gold-light text-[#040A07] px-6 py-4 rounded-full shadow-[0_10px_40px_rgba(212,184,134,0.4)] flex items-center gap-4 font-bold transition-transform hover:scale-105"
                        >
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-theme-gold">
                                    {cartCount}
                                </span>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">View Cart</span>
                                <span className="text-base font-light leading-none">₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Filter Drawer */}
            <div className={`fixed inset-0 z-[100] transition-opacity duration-500 ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
                
                {/* Drawer */}
                <div className={`absolute top-0 right-0 w-full md:w-[400px] h-full bg-[#040A07]/95 border-l border-theme-border/50 backdrop-blur-xl shadow-2xl p-8 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-heading font-light text-white flex items-center gap-2">
                            <Filter className="w-6 h-6 text-theme-gold" /> Filters
                        </h2>
                        <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-10 overflow-y-auto hide-scrollbar">
                        {/* Dietary Filter */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-theme-text/50 mb-4">Dietary Preference</h3>
                            <div className="flex flex-wrap gap-3">
                                {['All', 'Veg', 'Non-Veg', 'High Protein'].map((diet) => (
                                    <button 
                                        key={diet}
                                        onClick={() => setDietaryFilter(diet)}
                                        className={`px-4 py-2.5 rounded-none text-sm font-bold transition-all duration-300 border ${
                                            dietaryFilter === diet 
                                            ? 'bg-theme-gold text-black border-theme-gold shadow-[0_0_15px_rgba(212,184,134,0.3)]' 
                                            : 'bg-white/5 text-white border-white/10 hover:border-theme-gold/30'
                                        }`}
                                    >
                                        {diet}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-theme-text/50 mb-4 flex justify-between">
                                <span>Max Price</span>
                                <span className="text-theme-gold font-mono">₹{maxPrice}</span>
                            </h3>
                            <input 
                                type="range" 
                                min="50" 
                                max="2000" 
                                step="50"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-none appearance-none cursor-pointer accent-theme-gold"
                            />
                            <div className="flex justify-between text-xs text-white/30 mt-2 font-mono">
                                <span>₹50</span>
                                <span>₹2000</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="mt-8 pt-6 border-t border-theme-border/50 flex gap-4">
                        <button 
                            onClick={() => { setDietaryFilter('All'); setMaxPrice(2000); }}
                            className="flex-1 py-4 rounded-none font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Reset
                        </button>
                        <button 
                            onClick={() => setShowFilters(false)}
                            className="flex-[2] py-4 rounded-none font-bold bg-theme-gold hover:bg-theme-gold-light text-[#040A07] transition-all shadow-[0_0_20px_rgba(212,184,134,0.2)]"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-transparent pt-24 pb-12 flex justify-center"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>}>
            <MenuContent />
        </Suspense>
    );
}
