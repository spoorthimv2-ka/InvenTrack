import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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

  // ── 1. Unauthenticated → send to /login ────────────────────────────────
  if (!user && !pathname.startsWith("/login") && !pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ── 2. Authenticated user visiting /login → redirect to dashboard ──────
  if (user && pathname.startsWith("/login")) {
    // Fetch role to route correctly
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "staff";
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? "/admin/inventory" : "/staff/inventory";
    return NextResponse.redirect(url);
  }

  // ── 3. Role-based route guards (only for authenticated users) ───────────
  if (user && (pathname.startsWith("/admin") || pathname.startsWith("/staff"))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "staff";

    // Staff trying to access /admin → redirect to their own space
    if (role !== "admin" && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/staff/inventory";
      return NextResponse.redirect(url);
    }

    // Admin trying to access /staff → redirect to admin space
    if (role === "admin" && pathname.startsWith("/staff")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/inventory";
      return NextResponse.redirect(url);
    }
  }

  // ── 4. Legacy /inventory, /orders etc → redirect to role-based paths ────
  if (user && (pathname === "/" || pathname === "/inventory" || pathname === "/orders" || 
               pathname === "/reports" || pathname === "/suppliers")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "staff";
    const url = request.nextUrl.clone();
    url.pathname = role === "admin" ? `/admin${pathname === "/" ? "/inventory" : pathname}` : `/staff${pathname === "/" ? "/inventory" : pathname}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
