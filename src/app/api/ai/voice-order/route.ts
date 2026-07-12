import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Food } from '@/lib/models';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { transcript } = await req.json();
        
        if (!transcript) {
            return NextResponse.json({ success: false, message: 'No transcript provided' }, { status: 400 });
        }

        // Fetch all available menu items to pass to the AI
        const allFoods = await Food.find({ stock: { $gt: 0 } }).lean();
        
        const prompt = `
        You are an AI order assistant for a restaurant called Feastify. 
        A customer has spoken the following request: "${transcript}"
        
        Here is our current menu in JSON format:
        ${JSON.stringify(allFoods.map((f: any) => ({ id: f._id, name: f.name, category: f.category, price: f.price })))}
        
        Analyze their request and select the most appropriate menu items to fulfill it. 
        If they asked for "spicy", find something spicy. If they asked for "vegan", find vegan options.
        If they specify a quantity, respect it. If they don't, assume quantity 1 for each matched item.
        
        Return ONLY a JSON array of the chosen items in the following format, with no extra text or markdown:
        [
            { "foodId": "id_here", "quantity": 1 }
        ]
        `;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            // Fallback mock logic if no API key is provided
            console.warn("GEMINI_API_KEY not found. Using simple keyword matching fallback.");
            const matched = allFoods.filter((f: any) => transcript.toLowerCase().includes(f.name.toLowerCase()));
            return NextResponse.json({ 
                success: true, 
                items: matched.map((f: any) => ({ foodId: f._id, quantity: 1 }))
            });
        }

        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1 }
            })
        });

        const aiData = await aiResponse.json();
        const textOutput = aiData.candidates[0].content.parts[0].text.trim();
        
        // Clean markdown backticks if Gemini includes them
        const cleanJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedItems = JSON.parse(cleanJson);

        return NextResponse.json({ success: true, items: parsedItems });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
