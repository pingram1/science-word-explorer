import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SEED_READY_COOKIE = "swe_db_ready";

function isDemoMode(): boolean {
  return process.env.NODE_ENV === "development" || process.env.DEMO_MODE === "true";
}

export async function middleware(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.next();
  }

  if (request.cookies.has(SEED_READY_COOKIE)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/seed")) {
    return NextResponse.next();
  }

  try {
    const seedUrl = new URL("/api/seed", request.url);
    await fetch(seedUrl, {
      method: "POST",
      headers: { "x-middleware-seed": "1" },
    });
  } catch {
    // Repository seed will retry on first API access.
  }

  const response = NextResponse.next();
  response.cookies.set(SEED_READY_COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
