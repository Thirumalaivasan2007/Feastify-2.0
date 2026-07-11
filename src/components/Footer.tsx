'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
    const pathname = usePathname();

    if (pathname.startsWith('/receipt')) {
        return null;
    }
    const handleComingSoon = (e: React.MouseEvent) => {
        e.preventDefault();
        toast.success('Coming soon!');
    };

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Subscribed successfully!');
    };

    return (
        <footer className="relative bg-[#020503] border-t border-theme-border overflow-hidden pt-20 pb-10 print:hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-theme-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-theme-gold/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand Section */}
                    <div className="flex flex-col gap-6">
                        <Link href="/menu" className="text-3xl font-extrabold font-heading tracking-tight text-white flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-[0_0_15px_rgba(212,184,134,0.4)]">
                                <span className="text-[#040A07] font-bold text-2xl">F</span>
                            </div>
                            Feastify
                        </Link>
                        <p className="text-theme-text/60 leading-relaxed text-sm">
                            Experience the art of flavor, delivered directly to your door. We craft premium culinary experiences for the most discerning palates.
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <a href="#!" onClick={handleComingSoon} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-theme-text/80 hover:text-theme-gold hover:border-theme-gold/50 hover:bg-theme-gold/10 transition-all duration-300 hover:-translate-y-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </a>
                            <a href="#!" onClick={handleComingSoon} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-theme-text/80 hover:text-theme-gold hover:border-theme-gold/50 hover:bg-theme-gold/10 transition-all duration-300 hover:-translate-y-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                            </a>
                            <a href="#!" onClick={handleComingSoon} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-theme-text/80 hover:text-theme-gold hover:border-theme-gold/50 hover:bg-theme-gold/10 transition-all duration-300 hover:-translate-y-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            </a>
                            <a href="#!" onClick={handleComingSoon} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-theme-text/80 hover:text-theme-gold hover:border-theme-gold/50 hover:bg-theme-gold/10 transition-all duration-300 hover:-translate-y-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold font-heading text-white mb-6">Quick Links</h3>
                        <ul className="flex flex-col gap-4">
                            <li><Link href="/menu" className="text-theme-text/60 hover:text-theme-gold transition-colors text-sm flex items-center gap-2 group"><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Home</Link></li>
                            <li><Link href="/menu" className="text-theme-text/60 hover:text-theme-gold transition-colors text-sm flex items-center gap-2 group"><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Our Menu</Link></li>
                            <li><a href="#!" onClick={handleComingSoon} className="text-theme-text/60 hover:text-theme-gold transition-colors text-sm flex items-center gap-2 group"><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Track Order</a></li>
                            <li><a href="#!" onClick={handleComingSoon} className="text-theme-text/60 hover:text-theme-gold transition-colors text-sm flex items-center gap-2 group"><ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Testimonials</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold font-heading text-white mb-6">Contact Us</h3>
                        <ul className="flex flex-col gap-5">
                            <li className="flex items-start gap-4">
                                <MapPin className="w-5 h-5 text-theme-gold flex-shrink-0 mt-0.5" />
                                <span className="text-theme-text/60 text-sm leading-relaxed">Anthiyur , Erode District ,<br />Tamil Nadu ,India 638502</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-theme-gold flex-shrink-0" />
                                <span className="text-theme-text/60 text-sm">7305164503</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="w-5 h-5 text-theme-gold flex-shrink-0" />
                                <span className="text-theme-text/60 text-sm">admin.zylron.feastify@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-xl font-bold font-heading text-white mb-6">Newsletter</h3>
                        <p className="text-theme-text/60 text-sm mb-4 leading-relaxed">
                            Subscribe to receive exclusive offers, updates, and culinary news.
                        </p>
                        <form className="relative" onSubmit={handleSubscribe}>
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                required
                                suppressHydrationWarning
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-theme-gold/50 focus:ring-1 focus:ring-theme-gold/50 transition-all"
                            />
                            <button 
                                type="submit"
                                suppressHydrationWarning
                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-theme-gold hover:bg-theme-gold-light text-[#040A07] px-4 rounded-lg font-bold transition-colors flex items-center justify-center"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-theme-text/40 text-sm">
                        &copy; {new Date().getFullYear()} Feastify Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#!" onClick={handleComingSoon} className="text-theme-text/40 hover:text-theme-gold text-sm transition-colors">Privacy Policy</a>
                        <a href="#!" onClick={handleComingSoon} className="text-theme-text/40 hover:text-theme-gold text-sm transition-colors">Terms of Service</a>
                        <a href="#!" onClick={handleComingSoon} className="text-theme-text/40 hover:text-theme-gold text-sm transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
