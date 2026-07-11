import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    foodId: string;
    foodName: string;
    userEmail: string;
    onClose: () => void;
}

export default function ReviewModal({ isOpen, foodId, foodName, userEmail, onClose }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/foods/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ foodId, userEmail, rating, comment })
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success('Review submitted successfully!');
                onClose();
            } else {
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (err) {
            toast.error('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-theme-bg border border-theme-border/50 rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-4 h-4 text-white" />
                    </button>

                    <h2 className="text-2xl font-bold font-heading mb-2">Leave a Review</h2>
                    <p className="text-theme-text/60 mb-6 text-sm">How was your <span className="text-theme-gold font-bold">{foodName}</span>?</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-theme-text/60 mb-3">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none hover:scale-110 transition-transform"
                                    >
                                        <Star className={`w-8 h-8 ${rating >= star ? 'fill-theme-gold text-theme-gold' : 'text-white/20'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase tracking-wider text-theme-text/60 mb-3">Comment</label>
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us what you liked about it..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-theme-gold focus:outline-none min-h-[100px]"
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-theme-gold hover:bg-theme-gold-light text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
