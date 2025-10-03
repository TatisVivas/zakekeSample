import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware"; // Note: Adjusted to user-provided createClient

export async function middleware(req: NextRequest) {
  // Existing visitor cookie logic
  const cookieName = "merchlab_visitor";
  const cookie = req.cookies.get(cookieName)?.value;
  let response = NextResponse.next();
  if (!cookie) {
    const id = crypto.randomUUID();
    response.cookies.set(cookieName, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // Integrate Supabase cookie handling
  response = createClient(req);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
