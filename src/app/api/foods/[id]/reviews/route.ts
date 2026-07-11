import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Food } from '@/lib/models';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const review = await req.json();
        
        if (!review.userName || !review.rating || !review.comment) {
            return NextResponse.json({ success: false, message: 'Missing required review fields' }, { status: 400 });
        }

        const updatedFood = await Food.findByIdAndUpdate(
            id, 
            { $push: { reviews: review } }, 
            { new: true, runValidators: true }
        );
        
        if (updatedFood) {
            return NextResponse.json({ success: true, message: 'Review added successfully', food: updatedFood });
        } else {
            return NextResponse.json({ success: false, message: 'Food item not found' }, { status: 404 });
        }
    } catch (err: any) {
        return NextResponse.json({ success: false, message: 'Failed to add review: ' + err.message }, { status: 500 });
    }
}
