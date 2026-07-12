'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Trigger splash screen on route change
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1500); // Shorter 1.5s delay for route transitions
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#040A07] overflow-hidden"
                >
                    {/* Ambient Background Glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.1, 0.3, 0.1]
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                            className="w-96 h-96 bg-theme-gold/20 rounded-full blur-[100px]"
                        />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Logo Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative flex items-center space-x-6 mb-8 pr-12"
                        >
                            <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-full border border-theme-gold/40 flex items-center justify-center shrink-0">
                                <span className="font-serif text-3xl md:text-4xl text-theme-gold">F</span>
                            </div>
                            <div className="flex flex-col items-start text-left">
                                <span className="font-serif text-4xl md:text-6xl tracking-widest text-theme-gold font-semibold uppercase relative leading-none">
                                    Feastify
                                </span>
                                <span className="text-xs md:text-sm tracking-[0.3em] text-theme-text/60 uppercase font-sans mt-3 leading-none">
                                    Premium Dining
                                </span>
                            </div>
                            
                            {/* Minimalist Spinner */}
                            <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-theme-gold" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Progress Line */}
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "200px", opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                            className="h-px bg-gradient-to-r from-transparent via-theme-gold to-transparent"
                        />
                        
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="mt-6 text-xs uppercase tracking-[0.3em] text-theme-gold/60"
                        >
                            Preparing the Kitchen...
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
