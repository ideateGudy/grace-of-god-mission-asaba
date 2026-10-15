import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 network boundary proxy layer (formerly middleware).
 * Intercepts requests to /admin to ensure an active session cookie exists.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("gom_session");
    if (!session?.value) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
