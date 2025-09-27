import { NextRequest } from "next/server";
import { getClientToken, getDesignInfo } from "@/lib/zakeke";

export async function GET(req: NextRequest, context: { params: Promise<{ designId: string }> }) {
  try {
    const { designId } = await context.params;
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const info = await getDesignInfo(designId, access_token);
    return Response.json(info);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to fetch design";
    const status = /401/.test(msg) ? 401 : 500;
    return new Response(msg, { status });
  }
}
