import { NextRequest } from "next/server";
import { getProductByCode, setProductConfigurable } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const { code } = await context.params;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });
  setProductConfigurable(code, true);
  return new Response(null, { status: 200 });
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const { code } = await context.params;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });
  setProductConfigurable(code, false);
  return new Response(null, { status: 200 });
}