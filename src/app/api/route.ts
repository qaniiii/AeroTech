import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { customerName, customerEmail, shippingAddress, items, totalAmount } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Create order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          customer_email: customerEmail,
          shipping_address: shippingAddress,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'paid', // Simulated instant settlement
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Failed to generate order.');
    }

    // 2. Insert items into order_items
    const orderItemsData = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items error:', itemsError);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}