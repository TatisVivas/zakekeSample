import { NextRequest } from "next/server";
import { getProductByCode, getProductOptionsByCode } from "@/lib/db";
import { requireBasicAuth } from "@/lib/auth";

export async function GET(req: NextRequest, context: { params: Promise<{ code: string }> }) {
  const auth = requireBasicAuth(req);
  if (!auth.ok) return auth.error!;

  const { code } = await context.params;
  const product = getProductByCode(code);
  if (!product) return new Response("Not found", { status: 404 });

  // Return product options in Zakeke expected format:
  // [
  //   { code: "34523", name: "Color", values: [ { code: "537564567", name: "White" }, ... ] }
  // ]
  const options = getProductOptionsByCode(code);
  return Response.json(options, { status: 200 });
}
