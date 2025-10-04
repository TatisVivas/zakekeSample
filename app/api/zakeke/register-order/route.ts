import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getClientToken, registerOrder } from "@/lib/zakeke";
import { readVisitor } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  console.log(`[API_REGISTER_ORDER][${requestId}] Starting POST /api/zakeke/register-order`);

  try {
    const payload: any = await req.json();
    console.log(`[API_REGISTER_ORDER][${requestId}] Incoming payload:`, JSON.stringify(payload, null, 2));

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      console.warn(`[API_REGISTER_ORDER][${requestId}] No authenticated user`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const visitor = await readVisitor();
    console.log(`[API_REGISTER_ORDER][${requestId}] User: ${user.id}, Visitor: ${visitor}`);

    const tokenResponse = await getClientToken({
      accessType: "S2S",
      customercode: user.id,
      visitorcode: visitor
    });
    console.log(`[API_REGISTER_ORDER][${requestId}] Token response:`, JSON.stringify(tokenResponse, null, 2));
    const { access_token } = tokenResponse;

    if (!access_token) {
      throw new Error("Failed to obtain access token");
    }


    console.log(`[API_REGISTER_ORDER][${requestId}] Final payload:`, JSON.stringify(payload, null, 2));

    const res = await registerOrder(payload, access_token);
    console.log(`[API_REGISTER_ORDER][${requestId}] Zakeke response:`, JSON.stringify(res, null, 2));

    return NextResponse.json(res);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to register order";
    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(`[API_REGISTER_ORDER][${requestId}] Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status });
  }
}
