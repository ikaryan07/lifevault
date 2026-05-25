import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/auth/demo";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Old invite links used ?code= — messaging apps often strip query strings when sharing
  if (pathname === "/join-family") {
    const legacyCode = request.nextUrl.searchParams.get("code");
    if (legacyCode) {
      const normalized = legacyCode.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalized) {
        const url = request.nextUrl.clone();
        url.pathname = `/join-family/${normalized}`;
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  const isJoinFamily =
    pathname === "/join-family" || pathname.startsWith("/join-family/");
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isProtected =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    isJoinFamily;

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const safeNext = safeRedirectPath(returnPath);
    if (safeNext) url.searchParams.set("next", safeNext);
    if (isJoinFamily) {
      url.searchParams.set("force", "1");
    }
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage && request.nextUrl.searchParams.get("force") !== "1") {
    const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));
    if (next) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/join-family",
    "/join-family/:path*",
  ],
};
