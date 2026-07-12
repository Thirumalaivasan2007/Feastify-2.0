'use client';

import { Toaster } from 'react-hot-toast';

import { useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <>
            {children}
            <Toaster 
                position="top-center"
                toastOptions={{
                    style: {
                        background: 'rgba(4, 10, 7, 0.8)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(212, 184, 134, 0.15)',
                        color: '#E5E0D8',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        padding: '16px 24px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: '600',
                    },
                    success: {
                        iconTheme: {
                            primary: '#22c55e',
                            secondary: '#040A07',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#040A07',
                        },
                    },
                }}
            />
        </>
    );
}
