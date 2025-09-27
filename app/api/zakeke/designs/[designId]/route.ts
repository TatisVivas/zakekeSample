import { NextRequest } from "next/server";
import { getClientToken, getDesignInfo } from "@/lib/zakeke";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ designId: string }> }
) {
  const requestId = crypto.randomUUID();
  const startAt = Date.now();
  try {
    const { designId } = await context.params;
    console.log(`[ZAKEKE][DESIGN][${requestId}] GET design ${designId} start`);
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const info = await getDesignInfo(designId, access_token);
    console.log(
      `[ZAKEKE][DESIGN][${requestId}] success`,
      JSON.stringify({ tookMs: Date.now() - startAt, designId })
    );
    return Response.json(info);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to fetch design";
    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(
      `[ZAKEKE][DESIGN][${requestId}] error`,
      JSON.stringify({ tookMs: Date.now() - startAt, status, message: msg })
    );
    return new Response(msg, { status });
  }
}
