import { NextRequest } from "next/server";
import { getProductByCode, setProductCustomizable } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });
  setProductCustomizable(code, true);
  return new Response(null, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });
  setProductCustomizable(code, false);
  return new Response(null, { status: 200 });
}


