import { NextRequest } from "next/server";
import { getClientToken, registerOrder } from "@/lib/zakeke";

export async function POST(req: NextRequest) {
  try {
    const payload: unknown = await req.json();
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const res = await registerOrder(payload, access_token);
    return Response.json(res);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to register order";
    const status = /401/.test(msg) ? 401 : 500;
    return new Response(msg, { status });
  }
}


