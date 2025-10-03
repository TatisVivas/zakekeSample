import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getClientToken, registerOrder } from "@/lib/zakeke";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const startAt = Date.now();
  try {
    const payload: unknown = await req.json();
    console.log(`[ZAKEKE][ORDER][${requestId}] register order start`);

    // Get user session to obtain customercode
    let customercode: string | undefined;
    try {
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
                // This can be ignored if you have middleware refreshing
                // user sessions.
              }
            },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      customercode = user?.id;
    } catch (err) {
      console.warn(`[ZAKEKE][ORDER][${requestId}] Could not get user session:`, err);
    }

    const { access_token } = await getClientToken({
      accessType: "S2S",
      customercode
    });

    const res = await registerOrder(payload, access_token);
    console.log(
      `[ZAKEKE][ORDER][${requestId}] success`,
      JSON.stringify({ tookMs: Date.now() - startAt })
    );
    return Response.json(res);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to register order";
    const status = /401/.test(String(msg)) ? 401 : 500;
    console.error(
      `[ZAKEKE][ORDER][${requestId}] error`,
      JSON.stringify({ tookMs: Date.now() - startAt, status, message: msg })
    );
    return new Response(msg, { status });
  }
}
