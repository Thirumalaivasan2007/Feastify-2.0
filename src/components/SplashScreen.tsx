'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                        {/* Elegant Vertical Logo Animation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col items-center text-center space-y-8 mb-12"
                        >
                            {/* Circle Logo with Orbital Loader */}
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border border-theme-gold/10 flex items-center justify-center shadow-[0_0_40px_rgba(212,184,134,0.1)]"
                            >
                                <span className="font-serif text-4xl md:text-5xl text-theme-gold relative z-10">F</span>
                                
                                {/* Spinning Orbital Ring */}
                                <motion.div 
                                    className="absolute inset-0 rounded-full border-[1.5px] border-transparent border-t-theme-gold/80 border-r-theme-gold/30"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                />
                            </motion.div>

                            {/* Typography */}
                            <div className="flex flex-col items-center">
                                <span className="font-serif text-4xl md:text-5xl tracking-[0.25em] text-theme-gold font-light uppercase relative leading-none mb-5">
                                    Feastify
                                </span>
                                <span className="text-xs md:text-sm tracking-[0.4em] text-theme-text/50 uppercase font-sans leading-none">
                                    Premium Dining
                                </span>
                            </div>
                        </motion.div>

                        {/* Progress Line */}
                        <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "240px", opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                            className="h-[1px] bg-gradient-to-r from-transparent via-theme-gold/70 to-transparent"
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
