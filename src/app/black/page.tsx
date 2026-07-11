'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, ChevronRight, Gem, Shield, Star, Clock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const VIP_ITEMS = [
    { 
        id: "vip-1",
        name: "24k Gold-Leaf Tomahawk", 
        price: 25000, 
        desc: "A 40oz A5 Wagyu Tomahawk, aged for 45 days, delicately wrapped in edible 24k gold leaf. Served with a side of black truffle mash and a 1990 vintage Bordeaux reduction.", 
        tag: "Signature Culinary Art",
        image: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=1000&auto=format&fit=crop",
        prep: "2 Hours Advance Notice"
    },
    { 
        id: "vip-2",
        name: "White Truffle & Beluga Caviar Pizza", 
        price: 18000, 
        desc: "Artisanal 72-hour fermented sourdough crust, imported crème fraîche, 50g of Iranian Almas Beluga caviar, and generously shaved Italian Alba white truffles.", 
        tag: "Exclusive Import",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop",
        prep: "1 Hour Advance Notice"
    },
    { 
        id: "vip-3",
        name: "Private Chef Masterclass", 
        price: 75000, 
        desc: "Our Michelin-starred Executive Chef arrives at your residence with a full brigade to prepare, plate, and serve a custom 9-course tasting menu for up to 4 guests.", 
        tag: "Bespoke Experience",
        image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?q=80&w=1000&auto=format&fit=crop",
        prep: "48 Hours Advance Notice"
    },
];

export default function FeastifyBlack() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [requestedItems, setRequestedItems] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const handleUnlock = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (passcode.toUpperCase() === 'VIP2026') {
            setIsUnlocked(true);
            toast.success("Welcome to Feastify Black.", { icon: '👑', id: 'vip', style: { background: '#000', color: '#d4af37', border: '1px solid #d4af37' } });
        } else {
            setIsShaking(true);
            toast.error("Access Denied.", { id: 'vip', style: { background: '#000', color: '#ff4444', border: '1px solid #ff4444' } });
            setTimeout(() => setIsShaking(false), 500);
            setPasscode('');
        }
    };

    const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPasscode(val);
        if (val.toUpperCase() === 'VIP2026') {
            setTimeout(() => {
                setIsUnlocked(true);
                toast.success("Welcome to Feastify Black.", { icon: '👑', id: 'vip', style: { background: '#000', color: '#d4af37', border: '1px solid #d4af37' } });
            }, 300); // slight delay for dramatic effect
        }
    };

    const handleRequest = (id: string, name: string) => {
        setRequestedItems(prev => [...prev, id]);
        toast.success(`${name} requested. Our concierge will contact you shortly.`, {
            icon: '🛎️',
            style: { background: '#000', color: '#d4af37', border: '1px solid #d4af37' },
            duration: 4000
        });
    };

    return (
        <main className="min-h-screen bg-[#020504] text-white relative selection:bg-theme-gold selection:text-black font-sans">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-full h-[800px] bg-gradient-to-b from-theme-gold/5 to-transparent pointer-events-none" />

            <AnimatePresence mode="wait">
                {!isUnlocked ? (
                    <motion.div 
                        key="lock-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="h-screen w-full flex flex-col items-center justify-center p-6 relative z-10 overflow-hidden"
                    >
                        {/* Dynamic Mouse Spotlight */}
                        <motion.div 
                            className="pointer-events-none absolute inset-0 z-0 opacity-50"
                            animate={{
                                background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212,184,134,0.05), transparent 40%)`
                            }}
                            transition={{ type: "tween", ease: "linear", duration: 0 }}
                        />

                        {/* Ambient Particles */}
                        {mounted && [...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ 
                                    y: Math.random() * 800 - 400, 
                                    x: Math.random() * 800 - 400, 
                                    opacity: 0,
                                    scale: Math.random() * 0.5 + 0.5
                                }}
                                animate={{ 
                                    y: Math.random() * 800 - 400, 
                                    x: Math.random() * 800 - 400, 
                                    opacity: [0, 0.5, 0],
                                }}
                                transition={{ 
                                    duration: Math.random() * 10 + 10, 
                                    repeat: Infinity,
                                    ease: "linear" 
                                }}
                                className="absolute w-1 h-1 bg-theme-gold rounded-full blur-[1px]"
                            />
                        ))}
                        
                        <motion.div 
                            animate={isShaking ? { x: [-15, 15, -10, 10, -5, 5, 0] } : {}}
                            transition={{ duration: 0.5 }}
                            className="w-full max-w-md flex flex-col items-center"
                        >
                            <Crown className="w-20 h-20 text-theme-gold mb-10 opacity-90 filter drop-shadow-[0_0_15px_rgba(212,184,134,0.5)]" />
                            <h1 className="text-4xl font-serif tracking-[0.4em] uppercase text-theme-gold mb-3 text-center">Feastify Black</h1>
                            <p className="text-white/30 text-xs mb-16 tracking-[0.3em] text-center uppercase">Strictly By Invitation</p>

                            <form onSubmit={handleUnlock} className="w-full relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-gold/30 group-focus-within:text-theme-gold transition-colors" />
                                <input 
                                    type="password" 
                                    value={passcode}
                                    onChange={handlePasscodeChange}
                                    placeholder="ENTER VIP PASSCODE"
                                    className="w-full bg-black/40 border border-theme-gold/30 rounded-xl py-6 pl-14 pr-4 text-center text-theme-gold tracking-widest uppercase focus:outline-none focus:border-theme-gold focus:shadow-[0_0_30px_rgba(212,184,134,0.2)] transition-all backdrop-blur-xl text-xl placeholder:text-theme-gold/20"
                                />
                                <div className="absolute inset-0 border border-theme-gold/0 rounded-xl pointer-events-none transition-all duration-700 group-focus-within:border-theme-gold/50 group-focus-within:shadow-[inset_0_0_20px_rgba(212,184,134,0.1)]"></div>
                            </form>
                            
                            <button onClick={() => router.push('/')} className="mt-12 text-[10px] text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]">
                                Return to standard dining
                            </button>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="unlocked-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.2 }}
                        className="min-h-screen relative z-10 pt-16 pb-32 overflow-x-hidden"
                    >
                        <div className="max-w-7xl mx-auto px-6 lg:px-12">
                            {/* Header */}
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 border-b border-white/10 pb-8"
                            >
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-serif tracking-[0.3em] text-theme-gold uppercase mb-3">Feastify Black</h1>
                                    <p className="text-white/40 tracking-[0.2em] uppercase text-xs flex items-center gap-3">
                                        <Shield className="w-4 h-4 text-theme-gold" /> Level 5 Clearance Granted
                                    </p>
                                </div>
                                <button onClick={() => router.push('/')} className="mt-6 md:mt-0 text-xs uppercase tracking-[0.2em] text-white/30 hover:text-theme-gold transition-colors border border-white/10 hover:border-theme-gold px-6 py-3 rounded-none">
                                    Exit Black
                                </button>
                            </motion.div>

                            {/* Ultra Premium Cinematic List */}
                            <div className="space-y-32">
                                {VIP_ITEMS.map((item, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 100 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                        key={item.id}
                                        className={`flex flex-col ${i % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 lg:gap-20 items-center group`}
                                    >
                                        {/* Image Section */}
                                        <div className="w-full lg:w-1/2 relative h-[400px] lg:h-[600px] overflow-hidden rounded-sm">
                                            <div className="absolute inset-0 bg-theme-gold/10 group-hover:bg-transparent transition-colors duration-1000 z-10"></div>
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 scale-105 group-hover:scale-110 transition-all duration-[2s] ease-out"
                                            />
                                            {/* Decorative Corner Borders */}
                                            <div className="absolute top-4 left-4 w-12 h-12 border-t border-l border-theme-gold/50 z-20 transition-all duration-500 group-hover:w-16 group-hover:h-16 group-hover:border-theme-gold"></div>
                                            <div className="absolute bottom-4 right-4 w-12 h-12 border-b border-r border-theme-gold/50 z-20 transition-all duration-500 group-hover:w-16 group-hover:h-16 group-hover:border-theme-gold"></div>
                                        </div>
                                        
                                        {/* Content Section */}
                                        <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Gem className="w-5 h-5 text-theme-gold" />
                                                <span className="text-[10px] text-theme-gold tracking-[0.3em] uppercase font-bold border border-theme-gold/30 px-3 py-1.5 bg-theme-gold/5">
                                                    {item.tag}
                                                </span>
                                            </div>
                                            
                                            <h2 className="text-4xl lg:text-5xl font-serif text-white mb-6 leading-tight">
                                                {item.name}
                                            </h2>
                                            
                                            <p className="text-white/60 text-lg leading-relaxed mb-10 font-light max-w-lg">
                                                {item.desc}
                                            </p>
                                            
                                            <div className="flex items-center gap-6 mb-12">
                                                <div className="flex items-center gap-2 text-theme-gold/70 text-sm tracking-wider">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                </div>
                                                <div className="w-px h-6 bg-white/10"></div>
                                                <div className="flex items-center gap-2 text-white/40 text-sm">
                                                    <Clock className="w-4 h-4 text-theme-gold" /> {item.prep}
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 border-t border-white/10 pt-10">
                                                <div className="text-5xl font-serif text-theme-gold">
                                                    ₹{item.price.toLocaleString('en-IN')}
                                                </div>
                                                
                                                {requestedItems.includes(item.id) ? (
                                                    <div className="flex items-center gap-3 text-green-400 bg-green-400/10 border border-green-400/30 px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold">
                                                        <CheckCircle2 className="w-5 h-5" /> Experience Requested
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleRequest(item.id, item.name)}
                                                        className="group/btn relative px-8 py-4 bg-transparent border border-theme-gold text-theme-gold hover:bg-theme-gold hover:text-black transition-colors duration-500 flex items-center gap-4 uppercase tracking-[0.2em] text-xs font-bold overflow-hidden"
                                                    >
                                                        <span className="relative z-10">Reserve Experience</span>
                                                        <ChevronRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-2 transition-transform" />
                                                        <div className="absolute inset-0 bg-theme-gold translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-out z-0"></div>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
