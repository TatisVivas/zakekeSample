type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

async function fetchWithHandling(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const status = res.status;
    throw new Error(`Zakeke API error ${status}: ${text || res.statusText}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

const TOKEN_URL = process.env.ZAKEKE_TOKEN_URL || "https://api.zakeke.com/token";

export async function getClientToken(args: {
  accessType?: "S2S" | "B2C" | "C2S" | string;
  visitorcode?: string;
  customercode?: string;
}) {
  const clientId = process.env.ZAKEKE_CLIENT_ID;
  const clientSecret = process.env.ZAKEKE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Missing ZAKEKE client credentials");

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  if (args.accessType) body.set("access_type", args.accessType);
  if (args.visitorcode) body.set("visitorcode", args.visitorcode);
  if (args.customercode) body.set("customercode", args.customercode);

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const raw = await fetchWithHandling(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${basic}`,
    },
    body: body.toString(),
  });

  type RawToken = {
    access_token?: string;
    "access-token"?: string;
    expires_in?: number;
    token_type?: string;
  };

  const payload = raw as RawToken;
  const token: TokenResponse = {
    access_token: payload?.access_token ?? payload?.["access-token"] ?? "",
    expires_in: payload?.expires_in ?? 0,
    token_type: payload?.token_type ?? "Bearer",
  };

  if (!token.access_token) throw new Error("Zakeke token response missing access_token");
  return token;
}

export async function getDesignInfo(designId: string, token: string) {
  return fetchWithHandling(`https://api.zakeke.com/v3/designs/${encodeURIComponent(designId)}`, {
    method: "GET",
    headers: { authorization: `Bearer ${token}` },
  });
}

export async function registerOrder(payload: unknown, token: string) {
  return fetchWithHandling("https://api.zakeke.com/v2/order", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function getPrintZip(designId: string, token: string) {
  return fetchWithHandling(
    `https://api.zakeke.com/v1/designs/${encodeURIComponent(designId)}/outputfiles/zip`,
    {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    }
  );
}
