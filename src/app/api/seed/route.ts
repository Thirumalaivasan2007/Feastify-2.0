import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Order, Review, Food } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await connectDB();

        // 1. Clear existing specific fake data (Optional, but let's just clear drivers and reviews to be safe)
        await User.deleteMany({ role: 'driver' });
        await Review.deleteMany({});
        
        // 2. Create Real Drivers
        const passwordHash = await bcrypt.hash('password123', 10);
        const drivers = await User.insertMany([
            { name: 'Suresh J.', email: 'suresh@feastify.com', password: passwordHash, role: 'driver', totalDeliveries: 145, earnings: 4500, walletBalance: 200 },
            { name: 'Anil K.', email: 'anil@feastify.com', password: passwordHash, role: 'driver', totalDeliveries: 342, earnings: 12000, walletBalance: 500 },
            { name: 'Rahul M.', email: 'rahul@feastify.com', password: passwordHash, role: 'driver', totalDeliveries: 89, earnings: 2100, walletBalance: 50 },
            { name: 'Vikram S.', email: 'vikram@feastify.com', password: passwordHash, role: 'driver', totalDeliveries: 512, earnings: 18000, walletBalance: 1200 },
            { name: 'Karthik Raj', email: 'karthik@feastify.com', password: passwordHash, role: 'driver', totalDeliveries: 23, earnings: 800, walletBalance: 10 }
        ]);

        // 3. Create an Admin User if it doesn't exist
        const existingAdmin = await User.findOne({ email: 'admin@feastify.com' });
        if (!existingAdmin) {
            await User.create({
                name: 'Feastify Admin',
                email: 'admin@feastify.com',
                password: passwordHash,
                role: 'admin'
            });
        }

        // 4. Create some real orders with coordinates to populate the heatmap
        const baseLat = 13.0827; // Chennai coords
        const baseLng = 80.2707;
        
        // Let's create past orders assigned to these drivers
        const pastOrders = [];
        for (let i = 0; i < 20; i++) {
            const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
            pastOrders.push({
                customerDetails: { name: `Customer ${i}`, phone: '9999999999' },
                customerEmail: `customer${i}@test.com`,
                cartItems: [{ name: 'Truffle Pasta', price: 450, quantity: 1 }],
                totalAmount: 450,
                paymentMethod: 'card',
                orderStatus: 'Delivered',
                driverId: randomDriver._id,
                driverName: randomDriver.name,
                deliveryCoordinates: {
                    lat: baseLat + (Math.random() - 0.5) * 0.05,
                    lng: baseLng + (Math.random() - 0.5) * 0.05
                },
                timestamp: new Date(Date.now() - Math.random() * 1000000000)
            });
        }
        await Order.insertMany(pastOrders);

        // 5. Create real Reviews for the Social Feed
        // Find some real foods
        const allFoods = await Food.find({});
        if (allFoods.length > 0) {
            const reviews = [];
            for (let i = 0; i < 15; i++) {
                const randomFood = allFoods[Math.floor(Math.random() * allFoods.length)];
                reviews.push({
                    userName: `Customer ${i}`,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                    comment: `Absolutely loved the ${randomFood.name}! The quality was outstanding and delivery was super fast.`,
                    sentimentScore: 0.8 + (Math.random() * 0.2), // High sentiment
                    createdAt: new Date(Date.now() - Math.random() * 500000000)
                });
            }
            await Review.insertMany(reviews);
        } else {
             // If no foods, just create generic reviews
             const reviews = [];
             for (let i = 0; i < 15; i++) {
                 reviews.push({
                     userName: `Customer ${i}`,
                     rating: 5,
                     comment: `The food was amazing! Best premium experience ever.`,
                     sentimentScore: 0.9,
                     createdAt: new Date(Date.now() - Math.random() * 500000000)
                 });
             }
             await Review.insertMany(reviews);
        }

        return NextResponse.json({ success: true, message: 'Database seeded with real drivers, past orders, and social reviews!' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
