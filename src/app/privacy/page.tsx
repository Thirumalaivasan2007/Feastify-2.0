import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-28 pb-20 px-6">
            <Navbar />
            
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <Link href="/" className="text-theme-gold hover:text-white transition-colors text-sm font-bold uppercase tracking-widest mb-6 inline-block">
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-heading font-light text-white mb-4">Privacy Policy</h1>
                    <p className="text-theme-gold italic font-medium">Last updated: July 2026</p>
                </div>

                <div className="glass-panel p-8 md:p-12 space-y-8 text-theme-text/80 leading-relaxed font-sans">
                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">1. Information We Collect</h2>
                        <p className="mb-4">
                            At Feastify, we collect information that helps us deliver a Michelin-star culinary experience to your door. This includes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Personal identification information (Name, email address, phone number).</li>
                            <li>Delivery addresses and dietary preferences.</li>
                            <li>Payment information (processed securely through our third-party payment providers).</li>
                            <li>Usage data and interactive 3D studio preferences.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">
                            Your information is strictly used to curate and perfect your dining experience:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To process and deliver your orders accurately.</li>
                            <li>To personalize the 3D menu and remember your favorite dishes.</li>
                            <li>To communicate with you regarding your order status and exclusive offers.</li>
                            <li>To improve our website, services, and culinary offerings.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">3. Data Security</h2>
                        <p>
                            We implement a variety of premium security measures to maintain the safety of your personal information. Your data is encrypted and stored in highly secure environments. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-bold text-white mb-4">4. Your Rights</h2>
                        <p>
                            You have the right to access, update, or delete your personal information at any time through your Profile dashboard. If you require further assistance regarding your data privacy, please contact our concierge team.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
