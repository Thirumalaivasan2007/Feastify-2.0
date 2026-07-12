import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';

export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const role = url.searchParams.get('role');
        
        let query: any = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
        }

        const user = new User({ name, email, password, role });
        await user.save();

        return NextResponse.json({ success: true, message: 'User created successfully', user }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const { userId, role } = await req.json();

        if (!userId || !role) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Role updated successfully', user }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, message: "Missing user ID" }, { status: 400 });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Staff member removed successfully' }, { status: 200 });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
