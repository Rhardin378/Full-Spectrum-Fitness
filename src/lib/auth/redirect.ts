export const AUTH_PATH = "/auth";
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const UPDATE_PASSWORD_PATH = "/auth/update-password";
export const DEFAULT_SIGNED_IN_PATH = "/dashboard";

export const AUTH_REASONS = ["session", "link_invalid", "reset_expired"] as const;

export type AuthReason = (typeof AUTH_REASONS)[number];

export const AUTH_REASON_MESSAGES: Record<AuthReason, string> = {
  session: "Your session has expired. Please sign in again.",
  link_invalid:
    "That link is invalid or has already been used. Request a new one below.",
  reset_expired:
    "Your password reset link has expired. Request a new one below.",
};

export function getAuthReasonMessage(
  reason: string | string[] | null | undefined,
): string | null {
  const value = Array.isArray(reason) ? reason[0] : reason;

  if (value && (AUTH_REASONS as readonly string[]).includes(value)) {
    return AUTH_REASON_MESSAGES[value as AuthReason];
  }

  return null;
}

export function authPathWithReason(reason: AuthReason): string {
  return `${AUTH_PATH}?reason=${reason}`;
}

export function getPasswordResetRedirectUrl(origin: string): string {
  return `${origin}${AUTH_CALLBACK_PATH}?next=${encodeURIComponent(UPDATE_PASSWORD_PATH)}`;
}

export function getSignUpRedirectUrl(origin: string): string {
  return `${origin}${AUTH_CALLBACK_PATH}`;
}

// Only same-origin absolute paths. Rejects "//host", "/\host", and control characters
// that browsers strip or normalize into an off-site URL.
export function getSafeNextPath(
  next: string | null | undefined,
  fallback: string = DEFAULT_SIGNED_IN_PATH,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  if (next.includes("\\")) {
    return fallback;
  }

  for (const character of next) {
    const code = character.charCodeAt(0);
    if (code <= 0x1f || code === 0x7f) {
      return fallback;
    }
  }

  return next;
}

export function matchesPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}
