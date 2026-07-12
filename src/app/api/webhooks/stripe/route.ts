import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models';

// This is a mock Stripe Webhook endpoint
export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Ensure it's a Stripe event
        if (body.type === 'payment_intent.succeeded') {
            await connectDB();
            
            const paymentIntent = body.data.object;
            const orderId = paymentIntent.metadata.orderId;

            // Update order status upon successful payment webhook receipt
            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: 'Paid',
                    orderStatus: 'Preparing'
                });
            }

            return NextResponse.json({ received: true }, { status: 200 });
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
