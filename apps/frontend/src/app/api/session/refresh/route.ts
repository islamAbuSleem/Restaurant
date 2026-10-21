import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader.includes("refresh_token")) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: cookieHeader },
      body: JSON.stringify({}),
      cache: "no-store",
    });

    if (!response.ok) {
      // The refresh token is spent or revoked — clear it so the shell stops asking.
      const next = NextResponse.json({ ok: false }, { status: 401 });
      next.cookies.set("refresh_token", "", { path: "/", maxAge: 0 });
      return next;
    }

    const next = NextResponse.json({ ok: true });
    for (const value of response.headers.getSetCookie()) {
      next.headers.append("Set-Cookie", value);
    }
    return next;
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
