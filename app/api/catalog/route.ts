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

  const origin = new URL(req.url).origin;
  const items = data.items.map((p) => ({
    code: p.code,
    name: p.name,
    thumbnail:
      p.imageUrl
        ? (p.imageUrl.startsWith("http")
            ? p.imageUrl
            : `${origin}${p.imageUrl.startsWith("/") ? "" : "/"}${p.imageUrl}`)
        : `${origin}/totebag-sample.png`,
  }));

  // Zakeke espera un array simple de productos
  // Asegurar que el código sea numérico como requiere Zakeke
  const zakekeItems = items.map(item => ({
    code: item.code, // Ya es "1001" que es numérico
    name: item.name,
    thumbnail: item.thumbnail
  }));
  
  return Response.json(zakekeItems, { status: 200 });
}


