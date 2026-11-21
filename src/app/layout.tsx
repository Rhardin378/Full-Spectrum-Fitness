import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppHeader from "@/components/app-header";
import { ProfileProvider } from "@/components/profile/profile-provider";
import { getProfile } from "@/lib/profile/actions";
import type { Profile } from "@/lib/types/profile";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Full Spectrum Fitness",
  description:
    "Fitness tracking and mental wellness in one platform — built by Ryan Hardin, NASM-CPT.",
};

export default async function RootLayout({
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col antialiased`}
      >
        <ProfileProvider
          key={userId ?? "signed-out"}
          initialProfile={initialProfile}
          initialIsAuthenticated={userId !== null}
        >
          <AppHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </ProfileProvider>
      </body>
    </html>
  );
}
