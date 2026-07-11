import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
        }
        
        await connectDB();
        const orders = await Order.find({ customerEmail: email }).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
