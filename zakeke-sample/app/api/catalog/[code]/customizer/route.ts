import { NextRequest } from "next/server";
import { getProductByCode, setProductCustomizable } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const product = getProductByCode(params.code);
  if (!product) return new Response("Not found", { status: 404 });
  const updated = setProductCustomizable(params.code, true);
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { code: string } }) {
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;
  const product = getProductByCode(params.code);
  if (!product) return new Response("Not found", { status: 404 });
  const updated = setProductCustomizable(params.code, false);
  return Response.json(updated);
}


