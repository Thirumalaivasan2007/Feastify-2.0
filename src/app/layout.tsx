import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/ThemeContext';
import AIConcierge from '@/components/AIConcierge';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Feastify | Premium Food Delivery',
    description: 'Experience the art of flavor, delivered to your door.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-theme-bg text-theme-text selection:bg-theme-gold selection:text-[#040A07]`}>
                <div className="fixed inset-0 z-[-1] pointer-events-none bg-theme-bg bg-grid-pattern" />
                <ThemeProvider>
                    <Providers>
                        <div className="flex-grow">
                            {children}
                        </div>
                        <Footer />
                        <Toaster 
                            position="top-center"
                            toastOptions={{
                                style: {
                                    background: 'var(--color-theme-surface)',
                                    color: 'var(--color-theme-text)',
                                    border: '1px solid var(--color-theme-border)',
                                },
                            }}
                        />
                        <AIConcierge />
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    );
}
