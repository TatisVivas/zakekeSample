import { NextRequest } from "next/server";
import { getClientToken, registerOrder } from "@/lib/zakeke";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startAt = Date.now();
  try {
    const payload: unknown = await req.json();
    console.log(`[ZAKEKE][ORDER][${requestId}] register order start`);
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const res = await registerOrder(payload, access_token);
    console.log(
      `[ZAKEKE][ORDER][${requestId}] success`,
      JSON.stringify({ tookMs: Date.now() - startAt })
    );
    return Response.json(res);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to register order";
    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(
      `[ZAKEKE][ORDER][${requestId}] error`,
      JSON.stringify({ tookMs: Date.now() - startAt, status, message: msg })
    );
    return new Response(msg, { status });
  }
}
