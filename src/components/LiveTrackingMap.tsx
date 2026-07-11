'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, ChefHat, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LiveTrackingMap({ orderId, status, driverName }: { orderId: string, status: string, driverName?: string }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (status === 'Out for Delivery') {
            const timer = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) return 0; // Just loop the animation to show it's moving
                    return p + 2; 
                });
            }, 100); 
            return () => clearInterval(timer);
        } else if (status === 'Delivered') {
            setProgress(100);
        }
    }, [status]);

    return (
        <div className="w-full bg-theme-surface border border-theme-border rounded-3xl p-6 md:p-8 shadow-xl mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-heading font-extrabold flex items-center gap-2">
                        {status === 'Delivered' ? 'Order Arrived' : status === 'Out for Delivery' ? 'Driver is on the way' : status === 'Ready' ? 'Waiting for Driver' : 'Kitchen is preparing your order'}
                        {(status === 'Out for Delivery' || status === 'Ready') && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" />}
                    </h3>
                    <p className="text-theme-text/60 text-sm mt-1">Order #{orderId.slice(-6).toUpperCase()}</p>
                </div>
            </div>

            {/* Simulated SVG Map */}
            <div className="w-full h-48 bg-[#040a07] rounded-2xl relative overflow-hidden border border-white/5 flex items-center justify-center">
                {/* Background grid for map aesthetic */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                {status === 'Pending' || status === 'Preparing' ? (
                    <motion.div 
                        animate={{ scale: [1, 1.05, 1] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex flex-col items-center justify-center gap-4 opacity-50"
                    >
                        <div className="w-16 h-16 rounded-full bg-theme-gold/10 flex items-center justify-center border border-theme-gold/30">
                            <ChefHat className="w-8 h-8 text-theme-gold" />
                        </div>
                        <p className="text-xs tracking-widest uppercase">Chefs at work</p>
                    </motion.div>
                ) : status === 'Ready' ? (
                    <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex flex-col items-center justify-center gap-4 opacity-80"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                            <Package className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-xs tracking-widest uppercase text-green-500">Food Ready, Waiting for Driver</p>
                    </motion.div>
                ) : (
                    <div className="w-full h-full relative">
                        {/* The Path */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                            <path 
                                id="route"
                                d="M 50,75 C 100,20 200,140 350,75" 
                                fill="none" 
                                stroke="rgba(255,255,255,0.1)" 
                                strokeWidth="4" 
                                strokeDasharray="8 8"
                            />
                            {/* Animated progress path */}
                            <motion.path 
                                d="M 50,75 C 100,20 200,140 350,75" 
                                fill="none" 
                                stroke="#D4B886" 
                                strokeWidth="4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: progress / 100 }}
                                transition={{ duration: 0.5 }}
                            />
                        </svg>

                        {/* Restaurant Pin (Start) */}
                        <div className="absolute top-[75px] left-[50px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-theme-bg border-2 border-theme-gold rounded-full flex items-center justify-center shadow-lg z-10">
                            <ChefHat className="w-4 h-4 text-theme-gold" />
                        </div>

                        {/* Home Pin (End) */}
                        <div className="absolute top-[75px] left-[350px] -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-theme-bg border-2 border-theme-text rounded-full flex items-center justify-center shadow-lg z-10">
                            <MapPin className="w-4 h-4 text-theme-text" />
                        </div>

                        {/* Driver Icon */}
                        {status === 'Out for Delivery' && (
                            <motion.div 
                                className="absolute top-[75px] left-[50px] -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,184,134,0.5)] z-20"
                                initial={{ offsetPath: "path('M 50,75 C 100,20 200,140 350,75')", offsetDistance: "0%" } as any}
                                animate={{ offsetDistance: `${progress}%` } as any}
                                transition={{ duration: 0.5 }}
                            >
                                <Navigation className="w-5 h-5 text-black transform rotate-45" />
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Driver Details (Real Data) */}
            {status === 'Out for Delivery' && (
                <div className="mt-6 flex items-center gap-4 bg-black/10 p-4 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-full bg-theme-text/10 flex items-center justify-center font-bold">
                        {driverName ? driverName.charAt(0).toUpperCase() : 'D'}
                    </div>
                    <div>
                        <p className="font-bold">{driverName || 'Driver'} - Your Driver</p>
                        <p className="text-xs opacity-60 flex items-center gap-1 mt-1">
                            <Navigation className="w-3 h-3" /> Tracking Live
                        </p>
                    </div>
                    <button className="ml-auto px-4 py-2 bg-theme-surface border border-theme-gold/30 rounded-lg text-xs font-bold text-theme-gold hover:bg-theme-gold hover:text-black transition-colors">
                        Contact
                    </button>
                </div>
            )}
        </div>
    );
}
