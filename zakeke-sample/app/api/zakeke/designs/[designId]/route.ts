import { NextRequest } from "next/server";
import { getClientToken, getDesignInfo } from "@/lib/zakeke";

export async function GET(req: NextRequest, { params }: { params: { designId: string } }) {
  try {
    const { access_token } = await getClientToken({ accessType: "S2S" });
    const info = await getDesignInfo(params.designId, access_token);
    return Response.json(info);
  } catch (e: any) {
    const msg = e?.message || "Failed to fetch design";
    const status = /401/.test(msg) ? 401 : 500;
    return new Response(msg, { status });
  }
}


