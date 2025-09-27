import { NextRequest } from "next/server";
import { getProductByCode } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export async function GET(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;

  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });
  // Return empty variants/options for simplicity; extend as needed.
  return Response.json([]);
}
