import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, slug, description, price, stock_quantity, category_id, image_url } = await req.json();

    if (!title || !price) {
      return NextResponse.json({ error: 'Title and price are required.' }, { status: 400 });
    }

    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          title,
          slug: cleanSlug,
          description: description || '',
          price: parseFloat(price),
          stock_quantity: parseInt(stock_quantity, 10) || 0,
          category_id: category_id || null,
          images: image_url ? [image_url] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase product insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}