import { NextRequest, NextResponse } from "next/server";
import { getClientToken, getDesignInfo } from "@/lib/zakeke";
import { readVisitor } from "@/lib/visitor";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ designId: string }> }
) {
  const requestId = crypto.randomUUID();
  console.log(`[API_DESIGN][${requestId}] Starting GET /api/zakeke/designs/{designId}`);

  try {
    const { designId } = await context.params;
    const { searchParams } = new URL(req.url);
    const quantity = parseInt(searchParams.get('quantity') || '1', 10);

    console.log(`[API_DESIGN][${requestId}] Design ID: ${designId}, Quantity: ${quantity}`);

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
    const customercode = user?.id;

    const { access_token } = await getClientToken({
      accessType: "S2S",
      visitorcode,
      customercode,
    });
    console.log(`[API_DESIGN][${requestId}] Token acquired`);

    const info = await getDesignInfo(designId, quantity, access_token);
    console.log(`[API_DESIGN][${requestId}] Design info fetched`);

    return NextResponse.json(info);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to fetch design";
    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(`[API_DESIGN][${requestId}] Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status });
  }
}