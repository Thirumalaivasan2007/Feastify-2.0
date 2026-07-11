'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                className="glass-panel p-8 rounded-[2rem] w-full max-w-md border border-theme-gold/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-white/90">{title}</h3>
                </div>
                
                <p className="text-theme-text/70 mb-8 font-medium leading-relaxed">{message}</p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={onCancel} 
                        className="flex-1 bg-theme-surface hover:bg-theme-surface-hover text-theme-text font-bold py-3 rounded-xl border border-theme-border transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="flex-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold py-3 rounded-xl border border-red-500/30 hover:border-red-500 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                        Confirm
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
