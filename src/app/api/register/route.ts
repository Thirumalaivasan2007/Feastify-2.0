import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
        }

        const user = new User({ name, email, password, role: 'customer' });
        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: 'User registered successfully', 
            userId: user._id,
            redirect: '/menu'
        }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
}
