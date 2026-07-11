import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Coupon } from '@/lib/models';

export async function GET() {
    try {
        await connectDB();
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return NextResponse.json(coupons);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();
        
        // Ensure code is uppercase
        if (data.code) {
            data.code = data.code.toUpperCase();
        }

        const newCoupon = await Coupon.create(data);
        return NextResponse.json({ success: true, coupon: newCoupon });
    } catch (err: any) {
        if (err.code === 11000) {
            return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 });
        }
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
