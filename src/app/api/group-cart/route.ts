import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GroupCart } from '@/lib/models';
import { pusherServer } from '@/lib/pusher';

export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const groupId = url.searchParams.get('groupId');
        if (!groupId) return NextResponse.json({ success: false, message: 'Missing groupId' }, { status: 400 });

        let cart = await GroupCart.findOne({ groupId }).lean();
        if (!cart) {
            cart = await GroupCart.create({ groupId, items: [] });
        }

        return NextResponse.json({ success: true, cart: cart.items });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const { groupId, action, item } = await req.json();
        
        if (!groupId || !action || !item) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        let cart = await GroupCart.findOne({ groupId });
        if (!cart) {
            cart = new GroupCart({ groupId, items: [] });
        }

        if (action === 'add') {
            const existing = cart.items.find((i: any) => i.foodId === item.foodId);
            if (existing) {
                existing.quantity += (item.quantity || 1);
            } else {
                cart.items.push(item);
            }
        } else if (action === 'remove') {
            cart.items = cart.items.filter((i: any) => i.foodId !== item.foodId);
        } else if (action === 'decrease') {
            const existing = cart.items.find((i: any) => i.foodId === item.foodId);
            if (existing) {
                if (existing.quantity > 1) {
                    existing.quantity -= 1;
                } else {
                    cart.items = cart.items.filter((i: any) => i.foodId !== item.foodId);
                }
            }
        } else if (action === 'clear') {
            cart.items = [];
        }

        await cart.save();

        // Broadcast the update to all clients connected to this group
        try {
            await pusherServer.trigger(`group-${groupId}`, 'cart-updated', { items: cart.items });
        } catch (e) {
            console.warn('Pusher error:', e);
        }

        return NextResponse.json({ success: true, cart: cart.items });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
