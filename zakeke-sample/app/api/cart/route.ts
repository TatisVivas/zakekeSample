import { NextRequest } from "next/server";
import { addCartItem, getCartItems, upsertCartItemBySku } from "@/lib/db";

export async function GET() {
  return Response.json(getCartItems());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = addCartItem({ sku: body.sku, quantity: body.quantity || 1, designId: body.designId });
  return Response.json(created);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const updated = upsertCartItemBySku(body.sku, { quantity: body.quantity, designId: body.designId });
  return Response.json(updated);
}


