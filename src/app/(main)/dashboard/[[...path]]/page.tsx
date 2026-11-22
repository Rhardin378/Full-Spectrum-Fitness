import { redirect } from "next/navigation";

type DashboardRedirectProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params?: Promise<{ path?: string[] }>;
};

/**
 * Fallback when middleware does not rewrite. Prefer the middleware 308 so
 * the method and query string stay intact.
 */
export default async function DashboardRedirectPage({
  searchParams,
  params,
}: DashboardRedirectProps) {
  const resolvedParams = params ? await params : undefined;
  const segments = resolvedParams?.path ?? [];
  const path = segments.length > 0 ? segments.join("/") : "";
  const destinationPath = path ? `/fitness/${path}` : "/fitness";

  const resolvedSearch = searchParams ? await searchParams : undefined;
  const query = new URLSearchParams();
  if (resolvedSearch) {
    for (const [key, value] of Object.entries(resolvedSearch)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          query.append(key, item);
        }
      } else if (value != null) {
        query.set(key, value);
      }
    }
  }
  const search = query.toString();
  redirect(search ? `${destinationPath}?${search}` : destinationPath);
}
