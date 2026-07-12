import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Order } from '@/lib/models';

export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const driverId = url.searchParams.get('driverId');
        
        if (!driverId) {
            return NextResponse.json({ success: false, message: 'Driver ID is required' }, { status: 400 });
        }
        
        const driver = await User.findById(driverId);
        if (!driver || (driver.role !== 'driver' && driver.role !== 'admin')) { // Allow admin for testing
            return NextResponse.json({ success: false, message: 'Invalid driver' }, { status: 403 });
        }
        
        // Find active deliveries for this driver
        const activeDeliveries = await Order.countDocuments({
            driverId: driverId,
            orderStatus: { $in: ['Out for Delivery'] }
        });
        
        // Calculate earnings dynamically from delivered orders (assuming a flat rate of ₹40 per delivery for demo)
        const deliveredOrdersCount = await Order.countDocuments({
            driverId: driverId,
            orderStatus: 'Delivered'
        });
        const calculatedEarnings = (driver.earnings || 0) + (deliveredOrdersCount * 40);
        
        const recentDeliveredOrders = await Order.find({
            driverId: driverId,
            orderStatus: 'Delivered'
        }).sort({ timestamp: -1 }).limit(5);

        const recentPayouts = recentDeliveredOrders.map(o => ({
            id: o._id,
            amount: 40, // Base payout per delivery
            date: o.timestamp,
            status: 'Paid out successfully'
        }));

        return NextResponse.json({
            success: true,
            totalDeliveries: (driver.totalDeliveries || 0) + deliveredOrdersCount,
            earnings: calculatedEarnings,
            activeDeliveries,
            recentPayouts
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
