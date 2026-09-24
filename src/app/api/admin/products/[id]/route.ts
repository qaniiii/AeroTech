import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabase-admin';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('aerotech_admin_token')?.value;
  return token === 'authenticated_session_active';
}

// 1. DELETE Product
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized: Admin session expired' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 1. Delete associated order items first to satisfy foreign key constraints
    const { error: itemsErr } = await supabase
      .from('order_items')
      .delete()
      .eq('product_id', id);

    if (itemsErr) {
      console.warn('Warning: Could not clear related order_items:', itemsErr.message);
    }

    // 2. Delete the actual product and return the removed record
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If data is empty, Supabase RLS silently blocked the deletion
    if (!data || data.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product deletion blocked. Please verify that your Supabase RLS policy allows DELETE on the "products" table.' 
        }, 
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, deleted: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error deleting product' }, { status: 500 });
  }
}

// 2. EDIT / UPDATE Product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, price, stock_quantity, description, image_url, category_id } = body;

  const updateData: Record<string, any> = {
    title,
    price: Number(price),
    stock_quantity: Number(stock_quantity),
    images: image_url ? [image_url] : [],
  };

  if (category_id) {
    updateData.category_id = category_id;
  }

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}