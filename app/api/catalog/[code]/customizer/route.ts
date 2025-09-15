import { NextRequest } from "next/server";
import { getProductByCode, setProductCustomizable } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });
  const updated = setProductCustomizable(code, true);
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });
  const updated = setProductCustomizable(code, false);
  return Response.json(updated);
}


