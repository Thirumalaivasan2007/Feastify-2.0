import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        
        const { id } = await params;
        
        const order = await Order.findByIdAndUpdate(id, { 
            orderStatus: 'Cancelled',
            cancelledBy: 'customer',
            acknowledgedByAdmin: false
        }, { returnDocument: 'after' });
        
        if (!order) {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }
        
        console.log(`URGENT: Order ${id} cancelled by Customer`);

        return NextResponse.json({ success: true, message: 'Order cancelled' });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
