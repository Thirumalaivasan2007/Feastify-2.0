'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Utensils, Users, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Navbar from '@/components/Navbar';

export default function UltraPremiumLanding() {
    const router = useRouter();
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    
    // Floating elements transforms
    const floatY1 = useTransform(scrollYProgress, [0, 1], ["0px", "-200px"]);
    const floatY2 = useTransform(scrollYProgress, [0, 1], ["0px", "-100px"]);
    const floatY3 = useTransform(scrollYProgress, [0, 1], ["0px", "-300px"]);

    return (
        <main ref={targetRef} className="bg-[#040A07] text-white overflow-hidden selection:bg-theme-gold selection:text-black font-sans">
            <Navbar />

            {/* HERO SECTION */}
            <section className="relative h-screen flex flex-col items-center justify-center pt-20">
                {/* Parallax Background Video/Image */}
                <motion.div 
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0 z-0 pointer-events-none"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#040A07]/40 via-transparent to-[#040A07] z-10" />
                    <video 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover opacity-30 blur-sm scale-110"
                    >
                        <source src="https://cdn.pixabay.com/video/2020/06/15/42079-428612175_large.mp4" type="video/mp4" />
                    </video>
                </motion.div>

                {/* Floating Abstract Elements */}
                <motion.div style={{ y: floatY1 }} className="absolute top-[20%] left-[10%] w-64 h-64 bg-theme-gold/10 rounded-full blur-[100px] z-0 pointer-events-none" />
                <motion.div style={{ y: floatY2 }} className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-theme-gold/20 rounded-full blur-[120px] z-0 pointer-events-none" />
                <motion.div style={{ y: floatY3 }} className="absolute top-[40%] right-[20%] w-32 h-32 bg-white/5 rounded-full blur-[40px] z-0 pointer-events-none" />

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Text */}
                    <div className="text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl"
                        >
                            <Sparkles className="w-5 h-5 text-theme-gold" />
                            <span className="text-sm font-semibold tracking-widest uppercase text-white/90">The Future of Dining</span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.4 }}
                            className="text-6xl md:text-8xl lg:text-9xl font-heading font-extrabold tracking-tighter leading-[0.9] mb-8"
                        >
                            Feastify
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.6 }}
                            className="text-xl md:text-3xl font-light text-white/60 mb-12 max-w-2xl leading-relaxed"
                        >
                            Experience the collision of Michelin-star culinary artistry and bleeding-edge technology.
                        </motion.p>
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.8, type: "spring", bounce: 0.5 }}
                        >
                            <button 
                                onClick={() => router.push('/login')}
                                className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-gradient-to-r from-theme-gold-dark via-theme-gold-light to-theme-gold text-[#040A07] rounded-full font-bold text-lg overflow-hidden transition-all duration-500 hover:scale-105 shadow-[0_0_20px_rgba(212,184,134,0.3)] hover:shadow-[0_0_40px_rgba(243,229,200,0.5)]"
                            >
                                <span className="relative z-10">Enter the Portal</span>
                                <div className="relative z-10 w-10 h-10 rounded-full bg-[#040A07] flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300">
                                    <ArrowRight className="w-5 h-5 text-theme-gold" />
                                </div>
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column - 3D Motion Element */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, delay: 0.6, type: "spring" }}
                        className="relative hidden lg:flex items-center justify-center"
                    >
                        {/* Floating animation container */}
                        <motion.div
                            animate={{ 
                                y: [-15, 15, -15],
                                rotate: [-2, 2, -2]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative w-full max-w-[500px] aspect-square"
                        >
                            <img 
                                src="/hero-food.png" 
                                alt="Premium 3D Food" 
                                className="w-full h-full object-contain mix-blend-lighten opacity-90 drop-shadow-[0_0_50px_rgba(212,184,134,0.15)]"
                            />
                        </motion.div>
                    </motion.div>
                </div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">Scroll to explore</span>
                    <div className="w-[1px] h-16 bg-gradient-to-b from-white/40 to-transparent" />
                </motion.div>
            </section>

            {/* FEATURES SHOWCASE */}
            <section className="py-32 relative z-20 bg-[#040A07]">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-6xl font-heading font-extrabold mb-6">Engineered for <span className="text-theme-gold">Taste</span></h2>
                        <p className="text-xl text-white/50 max-w-2xl mx-auto">We didn't just build a delivery app. We built a synchronized ecosystem connecting chefs, drivers, and you in real-time.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Smartphone, title: "AI Voice Ordering", desc: "Just speak your cravings. Our Gemini-powered AI builds the perfect cart instantly." },
                            { icon: Users, title: "Multiplayer Carts", desc: "Share a link and watch your friends add items live on your screen. Synchronized dining." },
                            { icon: Zap, title: "Live Logistics", desc: "Down to the second. Watch your order progress from the chef's pan to your doorstep." }
                        ].map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: idx * 0.2 }}
                                className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] hover:bg-white/10 hover:border-theme-gold/30 transition-all group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-theme-gold/50 transition-all duration-500">
                                    <feature.icon className="w-8 h-8 text-theme-gold" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MASSIVE CTA FOOTER */}
            <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-theme-gold/5 z-0" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1934&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay z-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040A07] via-transparent to-[#040A07] z-10" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="relative z-20 text-center max-w-4xl mx-auto px-6"
                >
                    <h2 className="text-6xl md:text-8xl font-heading font-extrabold mb-8 drop-shadow-2xl">Hungry?</h2>
                    <button 
                        onClick={() => router.push('/login')}
                        className="btn-primary text-xl px-12 py-6 rounded-full shadow-[0_0_40px_rgba(212,184,134,0.4)] hover:shadow-[0_0_60px_rgba(212,184,134,0.6)]"
                    >
                        Start Your Journey
                    </button>
                </motion.div>
            </section>
        </main>
    );
}
