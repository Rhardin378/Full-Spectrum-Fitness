export function getProfileInitials(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  const trimmedName = displayName?.trim();
  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return trimmedName.slice(0, 2).toUpperCase();
  }

  const localPart = email?.split("@")[0]?.trim();
  if (localPart && localPart.length > 0) {
    return localPart.slice(0, 2).toUpperCase();
  }

  return "U";
}

export function getProfileMenuLabel(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string {
  const trimmedName = displayName?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const localPart = email?.split("@")[0]?.trim();
  if (localPart) {
    return localPart;
  }

  return "Account";
}
