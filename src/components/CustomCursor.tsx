'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName.toLowerCase() === 'button' || 
                target.tagName.toLowerCase() === 'a' || 
                target.closest('button') || 
                target.closest('a') ||
                target.classList.contains('cursor-pointer')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Inner Seed / Bean Shape */}
            <motion.div
                className="fixed top-0 left-0 w-6 h-6 text-theme-gold pointer-events-none z-[9999] drop-shadow-[0_2px_10px_rgba(212,184,134,0.5)]"
                animate={{
                    x: mousePosition.x - 12,
                    y: mousePosition.y - 12,
                    scale: isHovering ? 0 : 1,
                    rotate: mousePosition.x % 360, // Slight rotation effect as you move
                    opacity: 1
                }}
                transition={{
                    type: 'tween',
                    ease: 'backOut',
                    duration: 0.1,
                    rotate: { type: 'spring', damping: 20 }
                }}
            >
                {/* SVG for a coffee bean / seed */}
                <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M16.5 3.5C13.5 1.5 8 2 5.5 4.5C3 7 2.5 13.5 4.5 17C6.5 20.5 12 21 15.5 18.5C19 16 19.5 9 17.5 5.5C17.2 5 16.8 4.6 16.5 4.2V3.5ZM10.5 17.5C10 18 9 18 8.5 17.5C7.5 16.5 7.5 15 8.5 14C9.5 13 11 13 12 14C12.5 14.5 12.5 15.5 12 16L10.5 17.5ZM15.5 11.5C14.5 12.5 13 12.5 12 11.5C11 10.5 11 9 12 8C13 7 14.5 7 15.5 8C16.5 9 16.5 10.5 15.5 11.5Z" />
                    <path d="M12.5 5.5C10 5.5 8.5 7 8.5 9.5C8.5 10.5 9.5 11.5 10.5 11.5C13 11.5 14.5 10 14.5 7.5C14.5 6.5 13.5 5.5 12.5 5.5Z" opacity="0.5" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M17.8427 4.15729C19.7176 6.03223 20.1983 9.47547 18.7303 12.4116L12.4116 18.7303C9.47547 20.1983 6.03223 19.7176 4.15729 17.8427C2.28236 15.9678 1.80169 12.5245 3.2697 9.58843L9.58843 3.2697C12.5245 1.80169 15.9678 2.28236 17.8427 4.15729ZM15.957 6.04297C16.9209 7.00683 17.228 8.61869 16.7328 10.019L10.019 16.7328C8.61869 17.228 7.00683 16.9209 6.04297 15.957C5.0791 14.9932 4.77198 13.3813 5.26723 11.981L11.981 5.26723C13.3813 4.77198 14.9932 5.0791 15.957 6.04297Z" />
                </svg>
            </motion.div>
            
            {/* Outer Ring */}
            <motion.div
                className="fixed top-0 left-0 w-14 h-14 border border-theme-gold rounded-full pointer-events-none z-[9998]"
                animate={{
                    x: mousePosition.x - 28,
                    y: mousePosition.y - 28,
                    scale: isHovering ? 1.2 : 1,
                    backgroundColor: isHovering ? 'rgba(212, 184, 134, 0.1)' : 'transparent',
                    borderColor: isHovering ? 'transparent' : 'rgba(212, 184, 134, 0.5)'
                }}
                transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 18,
                    mass: 0.8
                }}
            />
        </>
    );
}
