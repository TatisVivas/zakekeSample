import { NextRequest } from "next/server";
import { getClientToken } from "@/lib/zakeke";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      accessType?: string;
      visitorcode?: string;
      customercode?: string;
    };
    const token = await getClientToken({
      accessType: body.accessType || "S2S",
      visitorcode: body.visitorcode,
      customercode: body.customercode,
    });
    return Response.json(token);
  } catch (e: any) {
    const msg = e?.message || "Failed to get token";
    const status = /401/.test(msg) ? 401 : 500;
    return new Response(msg, { status });
  }
}


