import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Review } from '@/lib/models';

export async function GET() {
    try {
        await connectDB();
        // Fetch real reviews from the DB, sorted by newest
        const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(20);
        return NextResponse.json(reviews);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
