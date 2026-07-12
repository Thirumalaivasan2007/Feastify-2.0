import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-28 pb-20 px-6">
            <Navbar />
            
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <Link href="/" className="text-theme-gold hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-6 inline-block">
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-heading font-light text-white mb-4">Terms of Service</h1>
                    <p className="text-theme-gold italic font-medium">Last updated: July 2026</p>
                </div>

                <div className="glass-panel p-8 md:p-12 space-y-8 text-theme-text/80 leading-relaxed font-sans">
                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Feastify, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">2. The Culinary Experience</h2>
                        <p className="mb-4">
                            Feastify is committed to providing Michelin-star quality meals delivered to your door. However, please note:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Images in our 3D Studio and Menu are for illustrative purposes. Actual presentation may slightly vary based on delivery conditions.</li>
                            <li>Allergens are clearly stated, but all food is prepared in a kitchen where cross-contamination may occur. It is the customer's responsibility to review dietary warnings.</li>
                            <li>Delivery times are estimates. While we strive for absolute punctuality, weather and traffic may cause slight variations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">3. Orders and Cancellation</h2>
                        <p>
                            Due to the bespoke nature and high-quality sourcing of our ingredients, orders can only be cancelled within 5 minutes of placement. Once an order enters the "Kitchen Preparing" state, cancellations are no longer accepted and no refunds will be issued.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">4. FeastPoints & Promotions</h2>
                        <p>
                            FeastPoints hold no cash value and can only be redeemed against future orders on the Feastify platform. We reserve the right to modify, suspend, or terminate promotional offers and the FeastPoints program at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">5. Modifications to Service</h2>
                        <p>
                            Feastify reserves the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the service.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
