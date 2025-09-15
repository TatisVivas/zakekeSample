import { NextRequest } from "next/server";
import { getProducts } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const search = searchParams.get("search") || undefined;
  const data = getProducts(page, 20, search);
  return Response.json(data);
}


