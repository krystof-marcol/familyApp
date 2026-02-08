import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const intlMiddleware = createMiddleware({
  locales: ["en", "cz"],
  defaultLocale: "en",
  localePrefix: "never",
});

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const token = await getToken({ req });
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/calendar", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth/signup", req.url));
    }
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/en") ||
    pathname.startsWith("/cz")
  ) {
    return intlMiddleware(req);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
