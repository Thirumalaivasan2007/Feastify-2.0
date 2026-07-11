import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Food } from '@/lib/models';

export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const email = url.searchParams.get('email');

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
        }

        const user = await User.findOne({ email }).populate('favorites');
        
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, favorites: user.favorites || [] });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, foodId } = await req.json();

        if (!email || !foodId) {
            return NextResponse.json({ success: false, message: 'Email and foodId required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Initialize favorites array if not exists
        if (!user.favorites) {
            user.favorites = [];
        }

        const index = user.favorites.findIndex((id: any) => id.toString() === foodId.toString());
        
        if (index > -1) {
            // Remove from favorites
            user.favorites.splice(index, 1);
        } else {
            // Add to favorites
            user.favorites.push(foodId);
        }

        user.markModified('favorites');
        await user.save();
        
        return NextResponse.json({ success: true, isFavorite: index === -1 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
