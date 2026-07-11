import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Coupon } from '@/lib/models';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { code, orderValue } = await req.json();

        if (!code) {
            return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return NextResponse.json({ success: false, message: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ success: false, message: 'This coupon is no longer active' }, { status: 400 });
        }

        if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
            return NextResponse.json({ success: false, message: 'This coupon has expired' }, { status: 400 });
        }

        if (coupon.maxUses !== null && coupon.usesCount >= coupon.maxUses) {
            return NextResponse.json({ success: false, message: 'This coupon has reached its usage limit' }, { status: 400 });
        }

        if (orderValue < coupon.minOrderValue) {
            return NextResponse.json({ success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required` }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            }
        });

    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
