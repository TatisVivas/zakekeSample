import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const cookieName = "merchlab_visitor";
  const cookie = req.cookies.get(cookieName)?.value;
  if (!cookie) {
    const res = NextResponse.next();
    const id = crypto.randomUUID();
    res.cookies.set(cookieName, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


