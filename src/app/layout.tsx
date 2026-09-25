import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProfileProvider } from "@/components/profile/profile-provider";
import { getOrCreateProfile } from "@/lib/profile/actions";
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
  let initialProfile = null;

  const profileResult = await getOrCreateProfile();
  if (profileResult.success) {
    initialProfile = profileResult.profile;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProfileProvider initialProfile={initialProfile}>
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
