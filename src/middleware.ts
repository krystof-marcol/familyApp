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
  if (
    pathname.includes("manifest.json") ||
    pathname.includes("sw.js") ||
    pathname.includes("workbox-") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }
  const token = await getToken({ req });
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/calendar", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth/signup", req.url));
    }
  }
  return intlMiddleware(req);
}
export const config = {
  matcher: ["/", "/(en|cz)/:path*"],
};
