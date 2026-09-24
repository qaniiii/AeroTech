import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CartItemInput {
  id: string;
  quantity: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customer_name, customer_email, total_amount, shipping_address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    // --- STEP 1: Strict Inventory Check for EVERY item ---
    for (const item of items as CartItemInput[]) {
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('id, title, stock_quantity')
        .eq('id', item.id)
        .single();

      if (fetchErr || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 404 }
        );
      }

      // Block checkout if user requested more than what is left
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.title}". Only ${product.stock_quantity} available, but you requested ${item.quantity}.`,
          },
          { status: 400 }
        );
      }
    }

    // --- STEP 2: Create Order Record ---
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        total_amount: Number(total_amount),
        shipping_address: shipping_address || '',
        payment_status: 'paid',
        status: 'processing',
      })
      .select()
      .single();

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 });
    }

    // --- STEP 3: Decrement Stock & Insert Order Items ---
    for (const item of items as CartItemInput[]) {
      // 1. Fetch current stock right before decrement
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.id)
        .single();

      const currentStock = currentProduct?.stock_quantity ?? item.quantity;
      const newStock = Math.max(0, currentStock - item.quantity);

      // 2. Decrement product stock
      await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.id);

      // 3. Insert order item reference
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
      });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}