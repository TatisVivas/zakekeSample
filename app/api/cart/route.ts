import { NextRequest } from "next/server";
import { addCartItem, getCartItems, upsertCartItemBySku, removeCartItem, getProductByCode } from "@/lib/db";

export async function GET() {
  const items = await getCartItems();

  // Enrich cart items with product information
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      try {
        const product = await getProductByCode(item.sku);
        return {
          ...item,
          product: product || null,
        };
      } catch (error) {
        console.error('Error fetching product for cart item:', item.sku, error);
        return {
          ...item,
          product: null,
        };
      }
    })
  );

  return Response.json(enrichedItems);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('POST /api/cart body:', body); // Debug log
  const created = await addCartItem({ sku: body.sku, quantity: body.quantity || 1, design_id: body.designId });
  return Response.json(created);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  console.log('PUT /api/cart body:', body); // Debug log
  const updated = await upsertCartItemBySku(body.sku, { quantity: body.quantity, design_id: body.designId });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return Response.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await removeCartItem(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return Response.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
