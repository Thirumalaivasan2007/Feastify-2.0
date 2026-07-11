import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models';

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({});
        return NextResponse.json(categories);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        
        const count = await Category.countDocuments();
        if (count >= 6) {
            return NextResponse.json({ success: false, message: 'Maximum 6 categories allowed.' }, { status: 400 });
        }
        
        const category = await Category.create(body);
        return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
