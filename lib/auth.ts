import { NextRequest } from "next/server";

export function requireBasicAuth(req: NextRequest): { ok: boolean; error?: Response } {
  const header = req.headers.get("authorization");
  if (!header || !header.toLowerCase().startsWith("basic ")) {
    return {
      ok: false,
      error: new Response("Missing Authorization header", {
        status: 401,
        headers: { "WWW-Authenticate": "Basic realm=\"Zakeke Catalog\"" },
      }),
    };
  }
  const b64 = header.split(" ")[1];
  try {
    const decoded = Buffer.from(b64, "base64").toString("utf8");
    const [user, pass] = decoded.split(":");
    const expectedUser = process.env.ZAKEKE_CLIENT_ID;
    const expectedPass = process.env.ZAKEKE_CLIENT_SECRET;
    if (!expectedUser || !expectedPass || user !== expectedUser || pass !== expectedPass) {
      return {
        ok: false,
        error: new Response("Invalid credentials", { status: 401 }),
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: new Response("Invalid Authorization header", { status: 400 }) };
  }
}


