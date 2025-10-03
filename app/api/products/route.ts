import { NextRequest } from "next/server";
import { getProducts, upsertProduct } from "@/lib/db";

export async function GET() {
  const data = await getProducts(1, 100);
  return Response.json(data.items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const updated = await upsertProduct(body);
  return Response.json(updated);
}


