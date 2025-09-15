import { cookies } from "next/headers";

const VISITOR_COOKIE = "merchlab_visitor";

export function getOrCreateVisitor(): string {
  const store = cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return id;
}

export function readVisitor(): string | undefined {
  return cookies().get(VISITOR_COOKIE)?.value;
}


