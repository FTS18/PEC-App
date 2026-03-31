import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(accessToken);

  // 1. Protect all routes in (protected)
  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/courses") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/settings");

  if (isProtectedPath && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    // Store the attempted URL to redirect back after login
    url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // 2. Prevent logged in users from visiting /auth
  if (pathname.startsWith("/auth") && accessToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
