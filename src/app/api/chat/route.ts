import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing from environment variables.');
      return NextResponse.json(
        { error: 'API key not configured in .env.local' },
        { status: 500 }
      );
    }

    const { message } = await req.json();

    // Fetch catalog for real-time context
    const { data: products } = await supabase
      .from('products')
      .select('title, price, stock_quantity, specs, description');

    const storeKnowledge = `
You are the AI tech concierge for "AEROTECH", an electronics store.
Store Policies:
- Shipping: Free standard shipping worldwide on orders over $50. Express 24h dispatch.
- Returns: 30-day hassle-free return policy. 1-year official manufacturer warranty.
- Current In-Stock Products:
${JSON.stringify(products || [], null, 2)}

User Question: ${message}
`;

    const ai = new GoogleGenAI({ apiKey });

    // Updated model to gemini-3.6-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: storeKnowledge,
    });

    return NextResponse.json({ reply: response.text });
  } catch (err: any) {
    console.error('Chat endpoint error detail:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}