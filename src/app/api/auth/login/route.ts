import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        // In a real app we check JWT/roles here. For this demo we just find the user.
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'driver' ? '/driver' : '/menu';

        return NextResponse.json({ 
            success: true, 
            message: 'Login successful', 
            role: user.role, 
            userId: user._id,
            name: user.name,
            redirect: redirectPath
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
