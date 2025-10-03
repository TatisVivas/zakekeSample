import { NextRequest } from "next/server";
import { migrateCartToUser } from "@/lib/db";
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (more secure)
    const cookieStore = await cookies()
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
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user?.id) {
      return Response.json({ error: 'No authenticated user' }, { status: 401 })
    }

    // Migrate cart
    await migrateCartToUser(user.id)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error migrating cart:', error)
    return Response.json({ error: 'Failed to migrate cart' }, { status: 500 })
  }
}
