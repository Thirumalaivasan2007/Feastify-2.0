import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models';

export async function GET() {
    try {
        await connectDB();
        const allOrders = await Order.find({});
        let total = 0, cod = 0, online = 0;
        let activeCount = 0, successCount = 0;
        
        allOrders.forEach(o => {
            const amount = o.totalAmount || 0;
            const method = (o.paymentMethod || '').trim().toUpperCase();
            const status = o.orderStatus;

            if (status === 'Delivered') {
                total += amount;
                if (method === 'COD') {
                    cod += amount;
                } else {
                    online += amount;
                }
                successCount++;
            } else if (['Pending', 'Preparing', 'Out for Delivery'].includes(status)) {
                activeCount++;
            }
        });
        
        return NextResponse.json({ total, cod, online, activeCount, successCount });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
