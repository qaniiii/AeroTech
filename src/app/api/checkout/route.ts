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
          payment_status: 'paid',
        },
      ])
      .select()
      .single();

    if (orderError || !order) {
      console.error('Supabase order creation error:', orderError);
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
      console.error('Supabase order_items error:', itemsError);
    }

    // 3. Decrement stock for each purchased item
    for (const item of items) {
      const { data: currentProduct, error: fetchErr } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.id)
        .single();

      if (fetchErr) {
        console.error(`Failed to fetch stock for product ${item.id}:`, fetchErr);
        continue;
      }

      if (currentProduct) {
        const newStock = Math.max(0, (currentProduct.stock_quantity ?? 0) - Number(item.quantity));
        
        const { error: updateErr } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.id);

        if (updateErr) {
          console.error(`Failed to update stock for product ${item.id}:`, updateErr);
        } else {
          console.log(`Decremented stock for ${item.title || item.id}: ${currentProduct.stock_quantity} -> ${newStock}`);
        }
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error('Checkout endpoint error:', err);
    return NextResponse.json(
      { error: err.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}