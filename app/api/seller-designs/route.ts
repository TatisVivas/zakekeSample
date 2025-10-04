import { NextRequest, NextResponse } from "next/server";
import { getClientToken, getSellerDesigns } from "@/lib/zakeke";
import { readVisitor } from "@/lib/visitor";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const requestId = crypto.randomUUID();
  console.log(`[API_SELLER_DESIGNS][${requestId}] Starting GET /api/seller-designs`);

  try {
    const visitorcode = await readVisitor();
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      console.log(`[API_SELLER_DESIGNS][${requestId}] No authenticated user`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customercode = user.id;
    console.log(`[API_SELLER_DESIGNS][${requestId}] Customer code: ${customercode}`);

    const { access_token } = await getClientToken({
      accessType: "S2S",
      visitorcode,
      customercode,
    });
    console.log(`[API_SELLER_DESIGNS][${requestId}] Token acquired`);

    const designs = await getSellerDesigns(customercode, access_token);
    console.log(`[API_SELLER_DESIGNS][${requestId}] Seller designs fetched`);

    return NextResponse.json(designs);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to fetch seller designs";

    // If Zakeke returns a 5xx error, it's likely processing. Tell the client to retry.
    if (/500|502|503|504/.test(msg)) {
      console.warn(`[API_SELLER_DESIGNS][${requestId}] Zakeke returned a server error, likely processing. Msg: ${msg}`);
      return NextResponse.json({ status: 'processing' }, { status: 202 });
    }

    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(`[API_SELLER_DESIGNS][${requestId}] Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status });
  }
}
