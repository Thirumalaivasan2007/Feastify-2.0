import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order, User } from '@/lib/models';

export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const email = url.searchParams.get('email');
        
        let query = {};
        if (email) {
            query = { customerEmail: email };
        }
        
        const orders = await Order.find(query).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: 'Failed to read orders: ' + err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const orderData = await req.json();
        const customerEmail = orderData.customerEmail || orderData.customerDetails?.email || 'N/A';
        
        const newOrder = await Order.create({
            ...orderData,
            customerEmail: customerEmail,
            customerDetails: orderData.customerDetails,
            orderStatus: orderData.orderStatus || 'Pending'
        });
        
        // Handle Coupon Usage
        if (orderData.appliedCoupon) {
            const { Coupon } = require('@/lib/models');
            await Coupon.updateOne(
                { code: orderData.appliedCoupon },
                { $inc: { usesCount: 1 } }
            );
        }
        
        // Handle Loyalty Points
        if (customerEmail !== 'N/A') {
            const user = await User.findOne({ email: customerEmail });
            if (user) {
                // Deduct points if used
                if (orderData.pointsUsed) {
                    user.feastPoints = Math.max(0, user.feastPoints - orderData.pointsUsed);
                }
                
                // Add new points (1 point per 100 spent)
                const pointsEarned = Math.floor(newOrder.totalAmount / 100);
                user.feastPoints += pointsEarned;
                
                // Update Tier
                if (user.feastPoints > 500) user.loyaltyTier = 'Black';
                else if (user.feastPoints > 200) user.loyaltyTier = 'Platinum';
                else user.loyaltyTier = 'Gold';
                
                await user.save();
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Order created successfully', 
            orderId: newOrder._id 
        }, { status: 201 });
    } catch(err: any) {
        return NextResponse.json({ success: false, message: 'Failed to write order: ' + err.message }, { status: 500 });
    }
}
