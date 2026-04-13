import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "umrahyuk_admin_token";

export function middleware(request: NextRequest) {
  const requiredToken = process.env.ADMIN_TOKEN;

  if (!requiredToken) {
    return new NextResponse("ADMIN_TOKEN belum dikonfigurasi di environment.", { status: 503 });
  }

  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = request.headers.get("x-admin-token");
  const queryToken = request.nextUrl.searchParams.get("token");

  const authorized = cookieToken === requiredToken || headerToken === requiredToken;
  if (authorized) return NextResponse.next();

  if (queryToken === requiredToken) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("token");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(ADMIN_COOKIE_NAME, requiredToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 8,
    });
    return response;
  }

  return new NextResponse("Unauthorized admin access.", { status: 401 });
}

export const config = {
  matcher: ["/admin/:path*"],
};
