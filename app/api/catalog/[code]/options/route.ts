import { NextRequest } from "next/server";
import { getProductByCode, getProductOptionsByCode } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;

  const { code } = await context.params;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });

  // Return product options in Zakeke expected format
  const options = getProductOptionsByCode(code);
  return Response.json(options, { status: 200 });
}
