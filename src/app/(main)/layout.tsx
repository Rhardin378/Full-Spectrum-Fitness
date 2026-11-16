import AppHeader from "@/components/app-header";
import { ProfileProvider } from "@/components/profile/profile-provider";
import { getProfile } from "@/lib/profile/actions";
import type { Profile } from "@/lib/types/profile";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userId: string | null = null;
  let initialProfile: Profile | null = null;

  // CI builds use dummy Supabase credentials and must not call Auth.
  if (process.env.CI !== "true") {
    const result = await getProfile();
    userId = result.userId;
    if (result.success) {
      initialProfile = result.profile;
    }
  }

  return (
    <ProfileProvider
      key={userId ?? "signed-out"}
      initialProfile={initialProfile}
      initialIsAuthenticated={userId !== null}
    >
      <AppHeader />
      {children}
    </ProfileProvider>
  );
}
