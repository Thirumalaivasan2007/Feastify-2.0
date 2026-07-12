'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Crown, ShieldCheck, Sun, Moon, Star, Navigation, Power } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function Navbar() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const u = JSON.parse(userStr);
            setUser(u);
        }
        
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
        };
        
        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        
        // Custom event to update cart count instantly
        window.addEventListener('cartUpdated', updateCartCount);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, []);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleMobileNavigation = (path: string) => {
        setIsMobileMenuOpen(false);
        router.push(path);
    };

    if (pathname.startsWith('/receipt')) {
        return null;
    }

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 border-b border-transparent print:hidden ${pathname === '/' ? 'bg-transparent backdrop-blur-sm' : 'bg-theme-bg/90 backdrop-blur-md'}`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center relative">
                
                {/* LEFT - LOGO */}
                <Link href={user?.role === 'admin' ? '/admin' : '/menu'} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 group z-50">
                    {/* Premium Monogram Logo */}
                    <div className="relative w-8 h-8 md:w-9 md:h-9 overflow-hidden rounded-full border border-theme-gold/30 group-hover:border-theme-gold transition-colors duration-300 flex items-center justify-center">
                        <span className="font-serif text-sm md:text-base text-theme-gold transition-transform duration-500 scale-105 group-hover:scale-110">F</span>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="font-serif text-lg md:text-xl tracking-widest text-theme-gold font-semibold uppercase relative leading-none">
                            Feastify
                        </span>
                        <span className="text-[8px] md:text-[9px] tracking-[0.2em] text-theme-text/40 uppercase font-sans mt-1 group-hover:text-theme-text/60 transition-colors duration-300 leading-none">
                            Premium Dining
                        </span>
                    </div>
                </Link>
                
                {/* CENTER - NAVIGATION (DESKTOP) */}
                <div className="hidden lg:flex items-center space-x-12">
                    {pathname === '/' ? (
                        <>
                            <Link href="#" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                                Cookie Policy
                            </Link>
                        </>
                    ) : user?.role === 'admin' ? (
                        <Link href="/admin" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                            Admin Dashboard
                        </Link>
                    ) : user?.role === 'driver' ? (
                        <Link href="/driver" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1 flex items-center gap-1">
                            <Navigation className="w-3 h-3"/> Driver Panel
                        </Link>
                    ) : user ? (
                        <>
                            <Link href="/menu" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                                Menu
                            </Link>
                            <Link href="/favorites" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                                Favorites
                            </Link>
                            <Link href="/orders" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                                Orders
                            </Link>
                            <Link href="/profile" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1">
                                Profile
                            </Link>
                            <Link href="/social" className="text-[11px] font-normal uppercase tracking-[0.15em] text-theme-text/80 hover:text-[#d4af37] transition-colors duration-300 relative py-1 flex items-center gap-1">
                                <Star className="w-3 h-3" /> Social
                            </Link>
                        </>
                    ) : null}
                </div>
                
                {/* RIGHT - ACTIONS */}
                <div className="flex items-center space-x-4 md:space-x-6 z-50">
                    {currentTime && pathname !== '/' && (
                        <div className="hidden md:flex flex-col items-end text-theme-text/80 mr-2 border-r border-white/10 pr-4">
                            <span className="text-base font-mono font-light tracking-widest text-theme-gold">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                            <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-theme-text/60">{currentTime.toLocaleDateString()}</span>
                        </div>
                    )}
                    <button 
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-theme-text/70 hover:text-theme-gold transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    
                    {user && pathname !== '/' && (
                        <button 
                            onClick={() => {
                                localStorage.removeItem('user');
                                window.location.href = '/';
                            }}
                            className="hidden md:flex p-2 rounded-full text-red-500/70 hover:text-red-500 transition-colors"
                            title="Log Out"
                        >
                            <Power className="w-5 h-5" />
                        </button>
                    )}
                    
                    {user?.role !== 'admin' && user?.role !== 'driver' && pathname !== '/' && (
                        <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="relative p-2.5 rounded-full border border-theme-gold/20 bg-theme-bg/40 text-theme-text hover:text-theme-gold hover:border-theme-gold/50 transition-all duration-300 group">
                                <ShoppingBag className="w-4 h-4 text-theme-text/70 group-hover:text-theme-gold transition-colors" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[#D4B886] text-theme-bg text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        
                        {/* Desktop Action Button */}
                        {pathname === '/' || !user ? (
                            <button 
                                onClick={() => router.push('/login')} 
                                className="hidden lg:block bg-theme-gold text-theme-bg px-6 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-[#d4af37] transition-all duration-300 rounded-none gold-shine shadow-md"
                            >
                                Sign In
                            </button>
                        ) : user.role !== 'admin' && user.role !== 'driver' && (
                            <button 
                                onClick={() => router.push('/menu')} 
                                className="hidden lg:block bg-theme-gold text-theme-bg px-6 py-2.5 text-xs font-semibold tracking-widest uppercase hover:bg-[#d4af37] transition-all duration-300 rounded-none gold-shine shadow-md"
                            >
                                Order Now
                            </button>
                        )}

                        {/* Mobile Hamburger Menu */}
                        <button 
                            className="lg:hidden text-theme-text hover:text-theme-gold transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* FULLSCREEN MOBILE MENU */}
            <div 
                className={`fixed inset-0 z-40 bg-theme-bg flex flex-col items-center justify-center transition-opacity duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div className="flex flex-col items-center gap-10 w-full px-8 max-w-sm">
                    {user?.role !== 'admin' && (
                        <button onClick={() => handleMobileNavigation('/menu')} className="text-3xl font-heading font-serif text-theme-text hover:text-theme-gold transition-colors">
                            Menu
                        </button>
                    )}
                    
                    {user?.role === 'admin' ? (
                        <button onClick={() => handleMobileNavigation('/admin')} className="text-3xl font-heading font-serif text-theme-text hover:text-theme-gold transition-colors">
                            Admin Dashboard
                        </button>
                    ) : user?.role === 'driver' ? (
                        <button onClick={() => handleMobileNavigation('/driver')} className="text-3xl font-heading font-serif text-theme-text hover:text-theme-gold transition-colors">
                            Driver Panel
                        </button>
                    ) : user ? (
                        <>
                            <button onClick={() => handleMobileNavigation('/favorites')} className="text-3xl font-heading font-serif text-theme-text hover:text-theme-gold transition-colors">
                                Favorites
                            </button>
                            <button onClick={() => handleMobileNavigation('/orders')} className="text-3xl font-heading font-serif text-theme-text hover:text-theme-gold transition-colors">
                                Orders
                            </button>
                            <button onClick={() => handleMobileNavigation('/profile')} className="text-3xl font-heading font-serif text-theme-text hover:text-theme-gold transition-colors">
                                Profile
                            </button>
                            <button onClick={() => handleMobileNavigation('/social')} className="text-3xl font-heading font-serif text-theme-text hover:text-theme-gold transition-colors flex items-center gap-2">
                                <Star className="w-6 h-6 text-theme-gold" /> Social
                            </button>
                        </>
                    ) : null}
                    
                    <div className="w-full h-px bg-white/10 my-2"></div>

                    <button 
                        onClick={toggleTheme}
                        className="flex items-center gap-3 text-xl font-serif text-theme-text/70 hover:text-theme-gold transition-colors"
                    >
                        {theme === 'dark' ? <><Sun className="w-6 h-6" /> Light Mode</> : <><Moon className="w-6 h-6" /> Dark Mode</>}
                    </button>

                    {user && (
                        <button 
                            onClick={() => {
                                localStorage.removeItem('user');
                                window.location.href = '/';
                            }}
                            className="flex items-center gap-3 text-xl font-serif text-red-500/70 hover:text-red-500 transition-colors mt-4"
                        >
                            <Power className="w-6 h-6" /> Log Out
                        </button>
                    )}
                    
                    {user?.role !== 'admin' && user?.role !== 'driver' && (
                        <button 
                            onClick={() => handleMobileNavigation('/menu')} 
                            className="w-full bg-[#D4B886] text-theme-bg py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-white transition-colors duration-300 rounded-none mt-6"
                        >
                            Order Now
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
