import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Food } from '@/lib/models';

export const revalidate = 60; // Edge Caching: Revalidate every 60 seconds

export async function GET() {
    try {
        await connectDB();
        const foods = await Food.find({});
        return NextResponse.json(foods);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const food = await Food.create(body);
        return NextResponse.json({ success: true, message: 'Food item added', food }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
