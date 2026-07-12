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
                            className="relative"
                        >
                            <h1 className="text-5xl md:text-7xl font-heading font-extrabold tracking-tight text-white mb-8">
                                Feastify<span className="text-theme-gold">.</span>
                            </h1>
                            
                            {/* Minimalist Spinner */}
                            <div className="absolute -right-12 top-0 bottom-0 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Loader2 className="w-8 h-8 text-theme-gold" />
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
