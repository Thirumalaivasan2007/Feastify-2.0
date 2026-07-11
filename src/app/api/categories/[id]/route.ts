import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category, Food } from '@/lib/models';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { name: newName } = await req.json();
        
        const { id } = await params;
        const oldCategory = await Category.findById(id);
        if (!oldCategory) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
        
        const oldName = oldCategory.name;
        oldCategory.name = newName;
        await oldCategory.save();
        
        const foodUpdate = await Food.updateMany({ category: oldName }, { category: newName });
        
        return NextResponse.json({ success: true, category: oldCategory, modifiedFoods: foodUpdate.modifiedCount });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        await Category.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Category deleted' });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
