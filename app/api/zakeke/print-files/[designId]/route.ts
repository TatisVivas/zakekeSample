import { NextRequest } from "next/server";
import { getClientToken, getPrintZip } from "@/lib/zakeke";

export async function GET(req: NextRequest, { params }: { params: { designId: string } }) {
  try {
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const res = (await getPrintZip(params.designId, access_token)) as any;
    // If real API returns a binary or different shape, map to { url }
    const url = typeof res === "string" ? res : res?.url || res?.downloadUrl || null;
    if (!url) return Response.json({ url: "" });
    return Response.json({ url });
  } catch (e: any) {
    const msg = e?.message || "Failed to get print files";
    const status = /401/.test(msg) ? 401 : 500;
    return new Response(msg, { status });
  }
}


