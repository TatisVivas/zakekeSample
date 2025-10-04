import { Buffer } from "node:buffer";

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

async function fetchWithHandling(url: string, options: RequestInit, retryCount = 0): Promise<any> {
  const method = (options.method || "GET").toUpperCase();
  const requestId = crypto.randomUUID();
  const started = Date.now();

  // Log request details (mask sensitive headers)
  const safeHeaders = options.headers ? { ...options.headers } : {};
  if ('authorization' in safeHeaders && safeHeaders.authorization) {
    safeHeaders.authorization = '[REDACTED]';
  }
  const safeBody = options.body ? '[BODY PRESENT]' : undefined;
  console.log(`[ZAKEKE][HTTP][${requestId}] Request: ${method} ${url}`, JSON.stringify({
    headers: safeHeaders,
    body: safeBody,
  }));

  try {
    const res = await fetch(url, options);
    const elapsed = Date.now() - started;
    const contentType = res.headers.get("content-type") || "";
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch {}

    // Log response details
    console.log(`[ZAKEKE][HTTP][${requestId}] Response: ${res.status} in ${elapsed}ms`, JSON.stringify({
      contentType,
      bodySnippet: bodyText.slice(0, 200),
    }));

    if (!res.ok) {
      if (res.status === 500 && retryCount < 3) {
        console.warn(`[ZAKEKE][HTTP][${requestId}] Retrying 500 error (${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchWithHandling(url, options, retryCount + 1);
      }
      throw new Error(`Zakeke API error ${res.status}: ${bodyText || res.statusText}`);
    }

    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(bodyText);
      } catch (e) {
        console.error(`[ZAKEKE][HTTP][${requestId}] JSON parse error:`, e);
        throw new Error("Invalid JSON response");
      }
    }
    return bodyText;
  } catch (error) {
    console.error(`[ZAKEKE][HTTP][${requestId}] Error:`, error);
    throw error;
  }
}

const TOKEN_URL = process.env.ZAKEKE_TOKEN_URL || "https://api.zakeke.com/token";

export async function getClientToken(args: {
  accessType?: "S2S" | "B2C" | "C2S" | string;
  visitorcode?: string;
  customercode?: string;
}) {
  const requestId = crypto.randomUUID();
  console.log(`[ZAKEKE][TOKEN][${requestId}] Starting token request`, JSON.stringify(args));

  const clientId = process.env.ZAKEKE_CLIENT_ID;
  const clientSecret = process.env.ZAKEKE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing ZAKEKE client credentials");
  }

  const baseBody = new URLSearchParams();
  baseBody.set("grant_type", "client_credentials");
  if (args.accessType) baseBody.set("access_type", args.accessType);
  if (args.customercode) baseBody.set("customercode", args.customercode);

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  type RawToken = {
    access_token?: string;
    "access-token"?: string;
    expires_in?: number;
    token_type?: string;
  };

  const commonHeaders = {
    accept: "application/json",
    "accept-language": "en-US",
    "content-type": "application/x-www-form-urlencoded",
  } as const;

  const attempt = async (label: string, useBasicAuth: boolean, includeVisitor: boolean) => {
    const body = new URLSearchParams(baseBody.toString());
    if (includeVisitor && args.visitorcode) body.set("visitorcode", args.visitorcode);

    const headers: Record<string, string> = { ...commonHeaders };
    if (useBasicAuth) {
      headers["authorization"] = `Basic ${basic}`;
    } else {
      body.set("client_id", clientId);
      body.set("client_secret", clientSecret);
    }

    console.log(`[ZAKEKE][TOKEN][${requestId}] Attempt ${label}`, JSON.stringify({
      useBasicAuth,
      includeVisitor: Boolean(includeVisitor && args.visitorcode),
      bodyKeys: Array.from(body.keys()),
    }));

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
      console.log(`[ZAKEKE][TOKEN][${requestId}] Success with ${label}`);
      return token;
    } catch (err) {
      lastError = err;
      console.error(`[ZAKEKE][TOKEN][${requestId}] Attempt ${label} failed:`, err);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All token attempts failed");
}

export async function getDesignInfo(designId: string, quantity: number, token: string) {
  const requestId = crypto.randomUUID();
  console.log(`[ZAKEKE][DESIGN_INFO][${requestId}] Fetching for ${designId} with quantity ${quantity} using v2`);
  try {
    const response = await fetchWithHandling(`https://api.zakeke.com/v2/designs/${encodeURIComponent(designId)}/${quantity}`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    });
    // Optional: Log for differences
    console.log(`[ZAKEKE][DESIGN_INFO][${requestId}] v2 Response:`, response);
    return response;
  } catch (error) {
    console.error(`[ZAKEKE][DESIGN_INFO][${requestId}] Error:`, error);
    throw error;
  }
}

export async function registerOrder(payload: unknown, token: string) {
  const requestId = crypto.randomUUID();
  console.log(`[ZAKEKE][REGISTER_ORDER][${requestId}] Starting with payload:`, JSON.stringify(payload, null, 2));
  try {

    const response = await fetchWithHandling("https://api.zakeke.com/v2/order", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    console.log(`[ZAKEKE][REGISTER_ORDER][${requestId}] Success:`, JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error(`[ZAKEKE][REGISTER_ORDER][${requestId}] Error:`, error);
    throw error;
  }
}

export async function getPrintZip(designId: string, token: string) {
  const requestId = crypto.randomUUID();
  console.log(`[ZAKEKE][PRINT_ZIP][${requestId}] Fetching for ${designId}`);
  try {
    const response = await fetchWithHandling(
      `https://api.zakeke.com/v1/designs/${encodeURIComponent(designId)}/outputfiles/zip`,
      {
        method: "GET",
        headers: { authorization: `Bearer ${token}` },
      }
    );
    console.log(`[ZAKEKE][PRINT_ZIP][${requestId}] Success:`, JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error(`[ZAKEKE][PRINT_ZIP][${requestId}] Error:`, error);
    throw error;
  }
}

export async function getSellerDesigns(customerCode: string, token: string) {
  const requestId = crypto.randomUUID();
  console.log(`[ZAKEKE][SELLER_DESIGNS][${requestId}] Fetching designs for customer ${customerCode}`);
  try {
    const response = await fetchWithHandling(`https://api.zakeke.com/v3/designs/seller?customerCode=${encodeURIComponent(customerCode)}`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    });
    console.log(`[ZAKEKE][SELLER_DESIGNS][${requestId}] Success:`, JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error(`[ZAKEKE][SELLER_DESIGNS][${requestId}] Error:`, error);
    throw error;
  }
}

export async function validateModelCode(modelCode: string, token: string): Promise<boolean> {
  const requestId = crypto.randomUUID();
  console.log(`[ZAKEKE][VALIDATE_MODEL][${requestId}] Validating ${modelCode}`);
  try {
    const sellerId = process.env.ZAKEKE_SELLER_ID || "288274";
    await fetchWithHandling(
      `https://api.zakeke.com/v3/products/${encodeURIComponent(modelCode)}?seller=${sellerId}`,
      {
        method: "GET",
        headers: { authorization: `Bearer ${token}` },
      }
    );
    console.log(`[ZAKEKE][VALIDATE_MODEL][${requestId}] Valid`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ZAKEKE][VALIDATE_MODEL][${requestId}] Failed:`, errorMsg);
    return false;
  }
}