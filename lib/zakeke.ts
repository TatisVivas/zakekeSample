import { Buffer } from "node:buffer";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

async function fetchWithHandling(url: string, options: RequestInit) {
  const method = (options.method || "GET").toUpperCase();
  const started = Date.now();
  const res = await fetch(url, options);
  const elapsed = Date.now() - started;

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    let text = "";
    try {
      text = await res.text();
    } catch {
      text = "";
    }
    console.error(
      `[ZAKEKE][HTTP] ${method} ${url} -> ${res.status} in ${elapsed}ms`,
      text ? `body(${Math.min(text.length, 800)} chars)` : "(no body)"
    );
    const status = res.status;
    throw new Error(`Zakeke API error ${status}: ${text || res.statusText}`);
  }

  console.log(`[ZAKEKE][HTTP] ${method} ${url} -> ${res.status} in ${elapsed}ms`);
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

  const hasClientId = Boolean(clientId);
  const hasClientSecret = Boolean(clientSecret);

  console.log(
    "[ZAKEKE][TOKEN] building request",
    JSON.stringify({
      accessType: args?.accessType || "C2S",
      hasVisitor: Boolean(args?.visitorcode),
      hasCustomer: Boolean(args?.customercode),
      env: { hasClientId, hasClientSecret },
      tokenUrl: TOKEN_URL,
    })
  );

  if (!clientId || !clientSecret) {
    throw new Error("Missing ZAKEKE client credentials");
  }

  const baseBody = new URLSearchParams();
  baseBody.set("grant_type", "client_credentials");
  if (args.accessType) baseBody.set("access_type", args.accessType);
  if (args.customercode) baseBody.set("customercode", args.customercode);
  // visitorcode will be conditionally added depending on attempt

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  type RawToken = {
    access_token?: string;
    "access-token"?: string;
    expires_in?: number;
    token_type?: string;
  };

  // Helper to build headers
  const commonHeaders = {
    accept: "application/json",
    "accept-language": "en-US",
    "content-type": "application/x-www-form-urlencoded",
  } as const;

  // Attempt helper
  const attempt = async (label: string, useBasicAuth: boolean, includeVisitor: boolean) => {
    const body = new URLSearchParams(baseBody.toString());
    if (includeVisitor && args.visitorcode) body.set("visitorcode", args.visitorcode);

    const headers: Record<string, string> = {
      ...commonHeaders,
    };
    if (useBasicAuth) {
      headers["authorization"] = `Basic ${basic}`;
    } else {
      // Send credentials in body
      body.set("client_id", clientId);
      body.set("client_secret", clientSecret);
    }

    console.log(
      "[ZAKEKE][TOKEN] attempt",
      JSON.stringify({
        label,
        useBasicAuth,
        includeVisitor: Boolean(includeVisitor && args.visitorcode),
        hasClientId,
        hasClientSecret,
        bodyKeys: Array.from(body.keys()),
      })
    );

    const raw = await fetchWithHandling(TOKEN_URL, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    const payload = raw as RawToken;
    const token: TokenResponse = {
      access_token: payload?.access_token ?? payload?.["access-token"] ?? "",
      expires_in: payload?.expires_in ?? 0,
      token_type: payload?.token_type ?? "Bearer",
    };
    if (!token.access_token) {
      throw new Error(`[${label}] Zakeke token response missing access_token`);
    }
    return token;
  };

  // Try multiple strategies: Basic/body and with/without visitorcode
  const strategies: Array<[string, boolean, boolean]> = [
    ["basic+visitor", true, true],
    ["basic", true, false],
    ["body+visitor", false, true],
    ["body", false, false],
  ];

  let lastError: unknown = null;
  for (const [label, useBasic, includeVisitor] of strategies) {
    try {
      const token = await attempt(label, useBasic, includeVisitor);
      console.log(
        "[ZAKEKE][TOKEN] success",
        JSON.stringify({ label, token_type: token.token_type, expires_in: token.expires_in })
      );
      return token;
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ZAKEKE][TOKEN] attempt failed", JSON.stringify({ label, message: msg }));
      // Continue to next strategy
    }
  }

  // If we got here, all attempts failed
  const finalMsg = lastError instanceof Error ? lastError.message : String(lastError);
  console.error("[ZAKEKE][TOKEN] all attempts failed", JSON.stringify({ message: finalMsg }));
  throw lastError instanceof Error ? lastError : new Error(finalMsg || "Token request failed");
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

/**
 * Validates if a model code exists in Zakeke for the given seller
 * This prevents 404 errors when opening the customizer
 */
export async function validateModelCode(modelCode: string, token: string): Promise<boolean> {
  try {
    const sellerId = process.env.ZAKEKE_SELLER_ID || "288274";
    const response = await fetchWithHandling(
      `https://api.zakeke.com/v3/products/${encodeURIComponent(modelCode)}?seller=${sellerId}`,
      {
        method: "GET",
        headers: { authorization: `Bearer ${token}` },
      }
    );
    console.log(`[ZAKEKE][VALIDATION] Model code ${modelCode} exists for seller ${sellerId}`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ZAKEKE][VALIDATION] Model code ${modelCode} validation failed:`, errorMsg);
    return false;
  }
}