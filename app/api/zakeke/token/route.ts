import { NextRequest } from "next/server";
import { getClientToken } from "@/lib/zakeke";
import { readVisitor } from "@/lib/visitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startAt = Date.now();
  try {
    const body = (await req.json().catch(() => ({}))) as {
      accessType?: string;
      visitorcode?: string;
      customercode?: string;
    };

    const visitorFromCookie = await readVisitor();

    const accessType = body?.accessType || "C2S";
    const hasVisitor =
      typeof (body?.visitorcode ?? visitorFromCookie) === "string" &&
      (body?.visitorcode ?? visitorFromCookie) !== "";

    const hasClientId = Boolean(process.env.ZAKEKE_CLIENT_ID);
    const hasClientSecret = Boolean(process.env.ZAKEKE_CLIENT_SECRET);

    console.log(
      `[ZAKEKE][TOKEN][${requestId}] POST /api/zakeke/token start`,
      JSON.stringify({
        accessType,
        hasVisitor,
        env: { hasClientId, hasClientSecret },
        tokenUrl: process.env.ZAKEKE_TOKEN_URL || "https://api.zakeke.com/token",
      })
    );

    if (!hasClientId || !hasClientSecret) {
      const msg =
        "Missing ZAKEKE client credentials. Set ZAKEKE_CLIENT_ID and ZAKEKE_CLIENT_SECRET in the server environment.";
      console.error(`[ZAKEKE][TOKEN][${requestId}] ${msg}`);
      return Response.json(
        {
          error: msg,
          hint:
            "Set credentials in your hosting environment (e.g. Vercel Project Settings → Environment Variables), then redeploy.",
          details: {
            accessType,
            hasVisitor,
            env: { hasClientId, hasClientSecret },
          },
        },
        { status: 500 }
      );
    }

    const token = await getClientToken({
      accessType,
      visitorcode: body.visitorcode ?? visitorFromCookie,
      customercode: body.customercode,
    });

    console.log(
      `[ZAKEKE][TOKEN][${requestId}] success`,
      JSON.stringify({
        tookMs: Date.now() - startAt,
        token_type: token?.token_type || "unknown",
        expires_in: token?.expires_in ?? 0,
      })
    );

    return Response.json(token);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to get token";
    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(
      `[ZAKEKE][TOKEN][${requestId}] error`,
      JSON.stringify({
        tookMs: Date.now() - startAt,
        status,
        message: msg,
      })
    );
    return Response.json(
      {
        error: "Failed to get token from Zakeke",
        message: msg,
        requestId,
      },
      { status }
    );
  }
}
