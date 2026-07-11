import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Food } from '@/lib/models';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const food = await Food.findById(id);
        if (!food) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json(food);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const body = await req.json();
        const { id } = await params;
        const food = await Food.findByIdAndUpdate(id, body, { returnDocument: 'after' });
        if (!food) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, food });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const food = await Food.findByIdAndDelete(id);
        if (!food) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Deleted' });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
