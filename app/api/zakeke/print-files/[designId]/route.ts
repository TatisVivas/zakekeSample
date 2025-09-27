import { NextRequest } from "next/server";
import { getClientToken, getPrintZip } from "@/lib/zakeke";

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
    console.log(`[ZAKEKE][PRINT][${requestId}] GET print zip for design ${designId} start`);
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const res = (await getPrintZip(designId, access_token)) as unknown;
    const url =
      typeof res === "string"
        ? res
        : (res as { url?: string; downloadUrl?: string } | null | undefined)?.url ||
          (res as { url?: string; downloadUrl?: string } | null | undefined)?.downloadUrl ||
          null;
    if (!url) {
      console.warn(
        `[ZAKEKE][PRINT][${requestId}] empty url`,
        JSON.stringify({ tookMs: Date.now() - startAt, designId })
      );
      return Response.json({ url: "" });
    }
    console.log(
      `[ZAKEKE][PRINT][${requestId}] success`,
      JSON.stringify({ tookMs: Date.now() - startAt, designId, url })
    );
    return Response.json({ url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get print files";
    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(
      `[ZAKEKE][PRINT][${requestId}] error`,
      JSON.stringify({ tookMs: Date.now() - startAt, status, message: msg })
    );
    return new Response(msg, { status });
  }
}
