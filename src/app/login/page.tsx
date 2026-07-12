'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { User, ShieldCheck, ArrowLeft, Loader2, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function LandingPage() {
    const [step, setStep] = useState<'role' | 'login' | 'register'>('role');
    const [role, setRole] = useState<'customer' | 'admin' | 'driver'>('customer');
    const [isLoading, setIsLoading] = useState(false);
    
    // Parallax mouse effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const x1 = useTransform(smoothX, [0, 1000], [-30, 30]);
    const y1 = useTransform(smoothY, [0, 1000], [-30, 30]);

    const x2 = useTransform(smoothX, [0, 1000], [40, -40]);
    const y2 = useTransform(smoothY, [0, 1000], [40, -40]);

    const x3 = useTransform(smoothX, [0, 1000], [-50, 50]);
    const y3 = useTransform(smoothY, [0, 1000], [50, -50]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);
    
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    
    const router = useRouter();

    const handleRoleSelect = (selectedRole: 'customer' | 'admin' | 'driver') => {
        setRole(selectedRole);
        setStep('login');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                if (data.role !== role) {
                    toast.error(`Unauthorized. Registered as ${data.role}.`);
                    setIsLoading(false);
                    return;
                }
                localStorage.setItem('user', JSON.stringify({ email, name: data.name, role: data.role, userId: data.userId }));
                toast.success('Login successful!');
                router.push(data.redirect);
            } else {
                toast.error(data.message || 'Login failed');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection error');
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('user', JSON.stringify({ email, name, role: 'customer', userId: data.userId }));
                toast.success('Account created successfully!');
                router.push(data.redirect);
            } else {
                toast.error(data.error || 'Registration failed');
                setIsLoading(false);
            }
        } catch (err) {
            console.error(err);
            toast.error('Connection error');
            setIsLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-theme-bg">
            {/* Background Image & Blur Overlay */}
            <div 
                className="absolute inset-0 z-0 opacity-20"
                style={{ 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop")',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    filter: 'blur(8px)'
                }}
            />
            
            {/* Parallax Floating Elements */}
            <motion.div style={{ x: x1, y: y1 }} className="absolute top-[20%] left-[10%] z-0 pointer-events-none opacity-40 blur-[2px]">
                <div className="w-16 h-16 bg-theme-gold/30 rounded-full"></div>
            </motion.div>
            <motion.div style={{ x: x2, y: y2 }} className="absolute top-[60%] left-[30%] z-0 pointer-events-none opacity-30 blur-[1px]">
                <div className="w-8 h-8 bg-white/30 rounded-full"></div>
            </motion.div>
            <motion.div style={{ x: x3, y: y3 }} className="absolute top-[30%] right-[15%] z-0 pointer-events-none opacity-50 blur-[3px]">
                <div className="w-24 h-24 border border-theme-gold/20 rounded-full"></div>
            </motion.div>
            <motion.div style={{ x: y1, y: x2 }} className="absolute bottom-[20%] right-[25%] z-0 pointer-events-none opacity-20">
                <div className="w-12 h-12 bg-white/20 rounded-lg rotate-45"></div>
            </motion.div>

            <div className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 items-center">
                {/* Hero Side */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-6xl lg:text-8xl font-heading font-extrabold mb-6 tracking-tight">
                        Feastify<span className="text-theme-gold">.</span>
                    </h1>
                    <p className="text-xl lg:text-2xl text-white/70 font-light max-w-md">
                        Experience the art of flavor, delivered straight to your door with unparalleled speed.
                    </p>
                </motion.div>

                {/* Auth Side */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className="glass-panel p-8 lg:p-12 rounded-3xl w-full max-w-md mx-auto"
                >
                    <AnimatePresence mode="wait">
                        {step === 'role' && (
                            <motion.div
                                key="role"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-heading font-semibold text-center text-white">Select Your Portal</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => handleRoleSelect('customer')}
                                        className="flex flex-col items-center justify-center gap-4 p-4 glass-card rounded-2xl hover:bg-theme-gold/10 hover:border-theme-gold/30 group"
                                    >
                                        <User className="w-8 h-8 text-white/50 group-hover:text-theme-gold transition-colors" />
                                        <span className="font-semibold text-white/80 group-hover:text-theme-gold">Customer</span>
                                    </button>
                                    <button 
                                        onClick={() => handleRoleSelect('driver')}
                                        className="flex flex-col items-center justify-center gap-4 p-4 glass-card rounded-2xl hover:bg-theme-gold/10 hover:border-theme-gold/30 group"
                                    >
                                        <Truck className="w-8 h-8 text-white/50 group-hover:text-theme-gold transition-colors" />
                                        <span className="font-semibold text-white/80 group-hover:text-theme-gold">Driver</span>
                                    </button>
                                    <button 
                                        onClick={() => handleRoleSelect('admin')}
                                        className="flex flex-col items-center justify-center gap-4 p-4 glass-card rounded-2xl hover:bg-theme-gold/10 hover:border-theme-gold/30 group"
                                    >
                                        <ShieldCheck className="w-8 h-8 text-white/50 group-hover:text-theme-gold transition-colors" />
                                        <span className="font-semibold text-white/80 group-hover:text-theme-gold">Admin</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'login' && (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <button onClick={() => setStep('role')} className="text-white/50 hover:text-white flex items-center gap-2 text-sm transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <h3 className="text-3xl font-heading font-bold">
                                    {role === 'admin' ? (
                                        <>Admin <span className="text-gradient">Portal</span></>
                                    ) : (
                                        <>Welcome <span className="text-gradient">Back</span></>
                                    )}
                                </h3>
                                
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-theme-gold focus:bg-white/10 transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Password</label>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-theme-gold focus:bg-white/10 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (role === 'admin' ? 'Secure Login' : 'Sign In')}
                                    </button>
                                </form>
                                
                                {role === 'customer' && (
                                    <p className="text-center text-sm text-white/50">
                                        Don't have an account?{' '}
                                        <button onClick={() => setStep('register')} className="text-theme-gold hover:text-[#E5D3B3] font-semibold">
                                            Register here
                                        </button>
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {step === 'register' && (
                            <motion.div
                                key="register"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <button onClick={() => setStep('login')} className="text-white/50 hover:text-white flex items-center gap-2 text-sm transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </button>
                                <h3 className="text-3xl font-heading font-bold">Create Account</h3>
                                
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-theme-gold focus:bg-white/10 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-theme-gold focus:bg-white/10 transition-all"
                                            placeholder="name@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Password</label>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required 
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-theme-gold focus:bg-white/10 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </main>
    );
}
