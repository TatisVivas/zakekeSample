import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      code: body.code,
      user_id: user.id,
      items: body.items,
      total: body.total,
      order_date: body.orderDate
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving order:', error);
    return Response.json({ error: 'Failed to save order' }, { status: 500 });
  }

  return Response.json(data);
}