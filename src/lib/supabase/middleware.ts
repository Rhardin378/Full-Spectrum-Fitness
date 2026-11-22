import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_CALLBACK_PATH,
  AUTH_PATH,
  DEFAULT_SIGNED_IN_PATH,
  UPDATE_PASSWORD_PATH,
  dashboardPathToFitness,
  matchesPath,
  type AuthReason,
} from "@/lib/auth/redirect";

const PROTECTED_PATHS = ["/fitness", "/profile", "/mind"];

// Matches sb-<ref>-auth-token and its chunked form sb-<ref>-auth-token.0
const AUTH_COOKIE_PATTERN = /^sb-.+-auth-token(\.\d+)?$/;

function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE_PATTERN.test(cookie.name));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  if (matchesPath(path, AUTH_CALLBACK_PATH)) {
    return response;
  }

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
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Read before getUser(), which may clear an expired session's cookies.
  const hadAuthCookie = hasAuthCookie(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  function redirectTo(pathname: string, reason?: AuthReason) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = reason ? `?reason=${reason}` : "";
    const redirectResponse = NextResponse.redirect(url);
    response.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  function redirectDashboardToFitness() {
    const fitnessPath = dashboardPathToFitness(path);
    if (!fitnessPath) {
      return null;
    }
    const url = request.nextUrl.clone();
    url.pathname = fitnessPath;
    // Keep the existing query string (clone already has it).
    const redirectResponse = NextResponse.redirect(url, 308);
    response.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (matchesPath(path, UPDATE_PASSWORD_PATH)) {
    return user ? response : redirectTo(AUTH_PATH, "reset_expired");
  }

  const isDashboardPath = dashboardPathToFitness(path) != null;
  const isProtectedPage =
    PROTECTED_PATHS.some((base) => matchesPath(path, base)) || isDashboardPath;

  if (!user && isProtectedPage) {
    return redirectTo(AUTH_PATH, hadAuthCookie ? "session" : undefined);
  }

  if (user && isDashboardPath) {
    return redirectDashboardToFitness() ?? response;
  }

  if (user && matchesPath(path, AUTH_PATH)) {
    return redirectTo(DEFAULT_SIGNED_IN_PATH);
  }

  return response;
}
