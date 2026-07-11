'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShoppingBag } from 'lucide-react';

const NOTIFICATIONS = [
    { user: 'Rahul from Mumbai', action: 'just ordered', item: 'Truffle Mushroom Pizza' },
    { user: 'Priya from Delhi', action: 'rated 5 stars for', item: 'Hyderabadi Chicken Biryani' },
    { user: 'Karan from Bangalore', action: 'just ordered', item: 'Classic Cheeseburger' },
    { user: 'Anita from Pune', action: 'redeemed FeastPoints for', item: 'Paneer Butter Masala' },
    { user: 'Vikram from Chennai', action: 'just ordered', item: 'Sushi Platter' },
    { user: 'Neha from Hyderabad', action: 'just added to cart:', item: 'Chocolate Lava Cake' }
];

export default function LiveNotifications() {
    const [currentNotif, setCurrentNotif] = useState<any>(null);

    useEffect(() => {
        // Only run on client
        const startSimulation = () => {
            const showNext = () => {
                const randomNotif = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
                setCurrentNotif(randomNotif);
                
                // Hide after 4 seconds
                setTimeout(() => {
                    setCurrentNotif(null);
                }, 4000);
            };

            // Initial delay
            setTimeout(() => {
                showNext();
                // Then repeat every 15-25 seconds
                setInterval(showNext, Math.random() * 10000 + 15000);
            }, 5000);
        };
        
        startSimulation();
    }, []);

    return (
        <AnimatePresence>
            {currentNotif && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -20 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="fixed bottom-6 left-6 z-[100] max-w-sm"
                >
                    <div className="glass-panel p-4 rounded-2xl flex items-start gap-4 border border-theme-gold/30 shadow-[0_10px_30px_rgba(212,184,134,0.15)] overflow-hidden relative group">
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-theme-gold to-transparent opacity-50"></div>
                        
                        <div className="w-10 h-10 rounded-full bg-theme-gold/20 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-5 h-5 text-theme-gold" />
                        </div>
                        
                        <div>
                            <div className="text-xs text-theme-text/70 mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {currentNotif.user}
                            </div>
                            <div className="text-sm font-medium text-white/90">
                                {currentNotif.action} <span className="font-bold text-theme-gold">{currentNotif.item}</span>
                            </div>
                            <div className="text-[10px] font-mono text-theme-text/50 mt-1 uppercase tracking-widest">
                                Just now
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
