import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/lib/models';
import { pusherServer } from '@/lib/pusher';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const order = await Order.findById(id).lean();
        if (order) {
            let driverInfo = null;
            if (order.driverId) {
                const { User } = require('@/lib/models');
                const driver = await User.findById(order.driverId).select('name email');
                if (driver) {
                    driverInfo = {
                        name: driver.name,
                        email: driver.email,
                        id: driver._id
                    };
                }
            }
            return NextResponse.json({ success: true, order: { ...order, driverInfo } });
        } else {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }
    } catch (err: any) {
        return NextResponse.json({ success: false, message: 'Failed to fetch order: ' + err.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { orderStatus, driverId, driverName, kdsDetails } = await req.json();
        const { id } = await params;
        
        let updateData: any = {};
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (driverId) updateData.driverId = driverId;
        if (driverName) updateData.driverName = driverName;
        if (kdsDetails) updateData.kdsDetails = kdsDetails;
        
        if (orderStatus === 'Delivered') {
            updateData.deliveredAt = new Date();
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            updateData, 
            { returnDocument: 'after' }
        );
        
        if (updatedOrder) {
            // Logic for Driver Earnings & Deliveries Count
            if (orderStatus === 'Delivered' && driverId) {
                const { User } = require('@/lib/models');
                await User.findByIdAndUpdate(driverId, {
                    $inc: { totalDeliveries: 1, earnings: 5 } // $5 delivery fee
                });
            }

            // Trigger real-time update
            try {
                await pusherServer.trigger(`order-${id}`, 'status-update', { 
                    status: orderStatus,
                    orderId: id 
                });
            } catch (pusherErr) {
                console.warn('Pusher error (keys missing or invalid):', pusherErr);
            }

            return NextResponse.json({ success: true, message: 'Status updated', order: updatedOrder });
        } else {
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }
    } catch (err: any) {
        return NextResponse.json({ success: false, message: 'Failed to update order: ' + err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        await Order.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Order permanently deleted' });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
