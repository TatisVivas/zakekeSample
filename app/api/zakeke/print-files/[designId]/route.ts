import { NextRequest } from "next/server";
import { getClientToken, getPrintZip } from "@/lib/zakeke";

export async function GET(req: NextRequest, { params }: { params: { designId: string } }) {
  try {
    const { designId } = params;
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const res = (await getPrintZip(designId, access_token)) as unknown;
    const url =
      typeof res === "string"
        ? res
        : (res as { url?: string; downloadUrl?: string } | null | undefined)?.url ||
          (res as { url?: string; downloadUrl?: string } | null | undefined)?.downloadUrl ||
          null;
    if (!url) return Response.json({ url: "" });
    return Response.json({ url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get print files";
    const status = /401/.test(msg) ? 401 : 500;
    return new Response(msg, { status });
  }
}
