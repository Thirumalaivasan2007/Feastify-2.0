import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Food, User } from '@/lib/models';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { foodId, userEmail, rating, comment } = await req.json();

        if (!foodId || !userEmail || !rating || !comment) {
            return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const food = await Food.findById(foodId);
        if (!food) {
            return NextResponse.json({ success: false, message: 'Food item not found' }, { status: 404 });
        }

        // Add review
        food.reviews.push({
            userName: user.name,
            rating: Number(rating),
            comment: comment,
            createdAt: new Date()
        });

        await food.save();

        return NextResponse.json({ success: true, message: 'Review added successfully', reviews: food.reviews });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
