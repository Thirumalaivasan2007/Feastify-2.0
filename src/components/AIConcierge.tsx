'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, ChefHat, Coffee, Leaf, Zap } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

// --- Typewriter Component for AI Messages ---
const TypewriterMessage = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, 15); // Typing speed
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [currentIndex, text, onComplete]);

    return <span>{displayedText}</span>;
};

export default function AIConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ id: string, role: 'ai' | 'user', text: string, action?: { label: string, type: string } }[]>([
        { id: '1', role: 'ai', text: 'Welcome to Feastify! I am your AI Culinary Expert. How can I elevate your dining experience today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    if (pathname?.startsWith('/receipt')) return null;

    const quickActions = [
        { label: "Surprise Me", icon: <Sparkles className="w-3 h-3" /> },
        { label: "Vegan Options", icon: <Leaf className="w-3 h-3" /> },
        { label: "High Protein", icon: <Zap className="w-3 h-3" /> },
        { label: "Desserts", icon: <Coffee className="w-3 h-3" /> }
    ];

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const getAIResponse = (input: string) => {
        const lowerInput = input.toLowerCase();
        
        // Greeting
        if (lowerInput.match(/^(hi|hello|hey|greetings)/)) {
            return { text: "Hello there! Craving something specific, or would you like me to recommend a Chef's Special?" };
        }
        
        // Mood / Surprise
        if (lowerInput.includes('surprise') || lowerInput.includes('recommend') || lowerInput.includes('don\'t know')) {
            return { 
                text: "I highly recommend the 24k Gold-Leaf Tomahawk Steak if you're feeling luxurious, or our Signature Truffle Pizza for a savory delight. Shall we?",
                action: { label: "Go to Feastify Black", type: 'black' }
            };
        }

        // Dietary
        if (lowerInput.includes('vegan') || lowerInput.includes('veg')) {
            return { 
                text: "Our plant-based culinary creations are exquisite. The Truffle Mushroom Risotto is an absolute favorite among our vegan guests.",
                action: { label: "View Vegan Menu", type: 'vegan' }
            };
        }
        if (lowerInput.includes('protein') || lowerInput.includes('diet') || lowerInput.includes('healthy')) {
            return { 
                text: "For high protein, you cannot go wrong with our Keto Grilled Salmon. It's perfectly balanced and rich in Omega-3.",
                action: { label: "View Healthy Options", type: 'healthy' }
            };
        }

        // Categories
        if (lowerInput.includes('spicy') || lowerInput.includes('biryani')) {
            return { 
                text: "Ah, you seek the heat! Our Authentic Hyderabadi Dum Biryani is masterfully spiced and slow-cooked to perfection.",
                action: { label: "View Biryani", type: 'biryani' }
            };
        }
        if (lowerInput.includes('sweet') || lowerInput.includes('dessert') || lowerInput.includes('cake')) {
            return { 
                text: "A sweet tooth! Our Saffron Rasmalai melts in your mouth, and the Molten Gold Choco Lava is an experience of its own.",
                action: { label: "View Desserts", type: 'desserts' }
            };
        }

        // Compliments / Jokes
        if (lowerInput.includes('love') || lowerInput.includes('beautiful') || lowerInput.includes('good')) {
            return { text: "Thank you! I was trained on thousands of Michelin-star recipes to serve you the absolute best." };
        }

        // Fallback
        return { text: "That sounds intriguing. While I process that, might I suggest taking a look at our full menu to discover our latest masterpieces?", action: { label: "Explore Menu", type: 'menu' } };
    };

    const handleSend = (textOverride?: string) => {
        const textToProcess = textOverride || inputValue.trim();
        if (!textToProcess) return;
        
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: textToProcess }]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const aiReply = getAIResponse(textToProcess);
            setMessages(prev => [...prev, { 
                id: (Date.now() + 1).toString(), 
                role: 'ai', 
                text: aiReply.text,
                action: aiReply.action
            }]);
            setIsTyping(false);
        }, 1200 + Math.random() * 800); // Random delay for realism
    };

    const handleActionClick = (type: string) => {
        setIsOpen(false);
        if (type === 'black') router.push('/black');
        else if (type === 'vegan') router.push('/menu?category=Healthy');
        else if (type === 'healthy') router.push('/menu?category=Healthy');
        else if (type === 'biryani') router.push('/menu?category=Biryani');
        else if (type === 'desserts') router.push('/menu?category=Desserts');
        else if (type === 'menu') router.push('/menu');
    };

    if (pathname === '/black') return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] print:hidden">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute bottom-20 right-0 w-[360px] sm:w-[420px] h-[550px] bg-[#020504]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_10px_50px_rgba(212,184,134,0.15)] flex flex-col overflow-hidden ring-1 ring-white/5"
                    >
                        {/* Dynamic Gradient Background inside */}
                        <div className="absolute inset-0 bg-gradient-to-br from-theme-gold/5 via-transparent to-blue-500/5 pointer-events-none" />

                        {/* Header */}
                        <div className="p-5 flex justify-between items-center border-b border-white/5 relative z-10 bg-black/20">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-gold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,184,134,0.4)]">
                                        <Bot className="w-6 h-6 text-black" />
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg text-white leading-none mb-1 tracking-wide">Aura</h3>
                                    <p className="text-[10px] font-mono tracking-widest text-theme-gold/80 uppercase flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> AI Concierge
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white border border-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 relative z-10">
                            {messages.map((msg, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    key={msg.id} 
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                        msg.role === 'user' 
                                        ? 'bg-gradient-gold text-black rounded-br-sm font-semibold' 
                                        : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm backdrop-blur-md'
                                    }`}>
                                        {msg.role === 'ai' ? (
                                            <TypewriterMessage text={msg.text} />
                                        ) : (
                                            msg.text
                                        )}
                                        
                                        {msg.role === 'ai' && msg.action && (
                                            <motion.button 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1 }} // Wait for some typing
                                                onClick={() => handleActionClick(msg.action!.type)} 
                                                className="mt-4 w-full py-2.5 bg-theme-gold/10 text-theme-gold hover:bg-theme-gold hover:text-black rounded-xl transition-all font-bold text-xs border border-theme-gold/30 tracking-widest uppercase flex items-center justify-center gap-2"
                                            >
                                                {msg.action.label} <ChefHat className="w-3 h-3" />
                                            </motion.button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-sm flex gap-2 items-center backdrop-blur-md">
                                        <motion.div 
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="w-2 h-2 bg-theme-gold rounded-full"
                                        />
                                        <motion.div 
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                            className="w-2 h-2 bg-theme-gold rounded-full"
                                        />
                                        <motion.div 
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                            className="w-2 h-2 bg-theme-gold rounded-full"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>

                        {/* Quick Actions (only show if AI just spoke and not typing) */}
                        {!isTyping && messages[messages.length-1].role === 'ai' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-5 pb-3 flex gap-2 overflow-x-auto hide-scrollbar relative z-10"
                            >
                                {quickActions.map(action => (
                                    <button 
                                        key={action.label}
                                        onClick={() => handleSend(action.label)}
                                        className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-white/70 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        {action.icon} {action.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-black/40 border-t border-white/5 relative z-10 backdrop-blur-md">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center group"
                            >
                                <input 
                                    type="text" 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask Aura anything..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-5 pr-14 text-sm focus:outline-none focus:border-theme-gold/50 focus:bg-white/10 transition-all text-white placeholder:text-white/30"
                                />
                                <button 
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="absolute right-2 p-2 bg-theme-gold text-black rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_15px_rgba(212,184,134,0.3)]"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,184,134,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 z-50 relative ${isOpen ? 'bg-[#020504] border border-theme-gold text-theme-gold' : 'bg-gradient-gold text-black'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : (
                    <div className="relative flex items-center justify-center w-full h-full">
                        <Sparkles className="w-7 h-7" />
                        {/* Ripple effect on the button when closed */}
                        <span className="absolute w-full h-full bg-theme-gold rounded-full opacity-50 animate-ping" style={{ animationDuration: '3s' }}></span>
                    </div>
                )}
            </button>
        </div>
    );
}
