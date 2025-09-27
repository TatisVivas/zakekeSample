import { NextRequest } from "next/server";
import { getClientToken } from "@/lib/zakeke";
import { readVisitor } from "@/lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      accessType?: string;
      visitorcode?: string;
      customercode?: string;
    };

    const visitorFromCookie = await readVisitor();

    const token = await getClientToken({
      accessType: body.accessType || "C2S",
      visitorcode: body.visitorcode ?? visitorFromCookie,
      customercode: body.customercode,
    });

    return Response.json(token);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get token";
    const status = /401/.test(msg) ? 401 : 500;
    return new Response(msg, { status });
  }
}
