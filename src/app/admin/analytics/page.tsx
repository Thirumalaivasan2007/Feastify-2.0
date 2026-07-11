'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [foods, setFoods] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, foodsRes] = await Promise.all([
                    fetch('/api/orders'),
                    fetch('/api/foods')
                ]);
                setOrders(await ordersRes.json());
                setFoods(await foodsRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <div className="min-h-screen bg-theme-bg flex items-center justify-center"><div className="w-10 h-10 border-4 border-theme-gold border-t-transparent rounded-full animate-spin"></div></div>;

    // --- Prepare Chart Data ---
    
    // 1. Best Selling Items Data (Quantity)
    const itemSales: Record<string, number> = {};
    orders.forEach(order => {
        if (order.cartItems && Array.isArray(order.cartItems)) {
            order.cartItems.forEach((item: any) => {
                itemSales[item.name] = (itemSales[item.name] || 0) + (item.quantity || 1);
            });
        }
    });
    
    // Sort items by sales and take top 5
    const topItems = Object.entries(itemSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        
    const bestSellingChartData = {
        labels: topItems.map(i => i[0]),
        datasets: [{
            label: 'Items Sold',
            data: topItems.map(i => i[1]),
            backgroundColor: 'rgba(212, 184, 134, 0.7)',
            borderColor: '#D4B886',
            borderWidth: 1,
            borderRadius: 8
        }]
    };
    
    // 2. Revenue by Category Data
    const categoryRevenue: Record<string, number> = {};
    // Create a map of food name to category
    const foodCategoryMap = foods.reduce((acc: any, food: any) => {
        acc[food.name] = food.category;
        return acc;
    }, {});
    
    orders.forEach(order => {
        if (order.cartItems && Array.isArray(order.cartItems)) {
            order.cartItems.forEach((item: any) => {
                const cat = foodCategoryMap[item.name] || 'Other';
                const revenue = (item.price || 0) * (item.quantity || 1);
                categoryRevenue[cat] = (categoryRevenue[cat] || 0) + revenue;
            });
        }
    });
    
    const categoryChartData = {
        labels: Object.keys(categoryRevenue),
        datasets: [{
            label: 'Revenue (₹)',
            data: Object.values(categoryRevenue),
            backgroundColor: [
                '#D4B886', // Gold
                '#3b82f6', // Blue
                '#10b981', // Green
                '#f43f5e', // Rose
                '#8b5cf6', // Purple
                '#f59e0b', // Amber
            ],
            borderColor: 'rgba(0,0,0,0.5)',
            borderWidth: 2,
        }]
    };

    return (
        <main className="min-h-screen bg-theme-bg text-theme-text pt-24 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-12">
                    <Link href="/admin" className="p-3 bg-white/5 hover:bg-theme-gold/20 rounded-full transition-colors text-theme-gold border border-theme-border/50">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-4xl font-heading font-extrabold flex items-center gap-4">
                        <TrendingUp className="w-10 h-10 text-theme-gold" />
                        Analytics <span className="text-gradient">& Charts</span>
                    </h1>
                </div>

                {/* Custom Revenue Chart */}
                <div className="glass-panel p-8 rounded-[2rem] border border-theme-border/50 mb-12 shadow-[0_0_40px_rgba(212,184,134,0.05)]">
                    <h3 className="text-2xl font-bold font-heading mb-10 flex items-center gap-3">
                        <span className="w-2 h-8 bg-theme-gold rounded-full"></span>
                        Revenue Overview (Last 7 Days)
                    </h3>
                    <div className="h-72 flex items-end justify-between gap-2 md:gap-4 mt-8 px-4">
                        {[...Array(7)].map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() - (6 - i));
                            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
                            
                            const dayRevenue = orders.filter(o => {
                                const od = new Date(o.createdAt || o.timestamp);
                                return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
                            }).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                            
                            const maxRev = Math.max(2000, ...orders.map(o => (o.totalAmount || 0) * 5)); 
                            const heightPercentage = Math.min(100, Math.max(5, (dayRevenue / maxRev) * 100));

                            return (
                                <div key={i} className="flex flex-col items-center flex-1 group h-full">
                                    <div className="relative w-full flex justify-center flex-1 items-end h-full">
                                        <div 
                                            className="w-full max-w-[50px] bg-theme-gold/10 rounded-t-xl relative overflow-hidden group-hover:bg-theme-gold/20 transition-colors cursor-pointer border-t border-theme-gold/20"
                                            style={{ height: `${heightPercentage}%`, minHeight: '10%' }}
                                        >
                                            <motion.div 
                                                initial={{ height: 0 }}
                                                animate={{ height: '100%' }}
                                                transition={{ duration: 1.2, delay: i * 0.15, type: 'spring' }}
                                                className="absolute bottom-0 left-0 right-0 bg-gradient-gold rounded-t-xl opacity-90 shadow-[0_0_15px_rgba(212,184,134,0.5)]"
                                            />
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#040A07] text-theme-gold text-sm font-bold py-2 px-4 rounded-xl border border-theme-gold/40 shadow-xl pointer-events-none whitespace-nowrap z-10 transform -translate-y-2 group-hover:translate-y-0 duration-300">
                                            ₹{dayRevenue.toFixed(0)}
                                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#040A07] border-b border-r border-theme-gold/40 transform rotate-45"></div>
                                        </div>
                                    </div>
                                    <div className="text-theme-text/60 text-sm font-bold uppercase mt-6 group-hover:text-theme-gold transition-colors">{dateStr}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Chart.js Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="glass-panel p-8 rounded-[2rem] border border-theme-border/50">
                        <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-3">
                            <span className="w-2 h-6 bg-theme-gold rounded-full"></span>
                            Best Selling Items
                        </h3>
                        <div className="h-80 flex items-center justify-center">
                            <Bar 
                                data={bestSellingChartData} 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { ticks: { color: 'rgba(255,255,255,0.5)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                                        x: { ticks: { color: 'rgba(255,255,255,0.8)' }, grid: { display: false } }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                    
                    <div className="glass-panel p-8 rounded-[2rem] border border-theme-border/50">
                        <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-3">
                            <span className="w-2 h-6 bg-theme-gold rounded-full"></span>
                            Revenue by Category
                        </h3>
                        <div className="h-80 flex items-center justify-center pb-4">
                            <Doughnut 
                                data={categoryChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'right', labels: { color: 'rgba(255,255,255,0.8)', padding: 20 } }
                                    },
                                    cutout: '65%',
                                    elements: { arc: { borderWidth: 0 } }
                                }} 
                            />
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
