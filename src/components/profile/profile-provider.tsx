"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Profile } from "@/lib/types/profile";

type ProfileContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  errorMessage: string | null;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

type ProfileProviderProps = {
  initialProfile: Profile | null;
  children: ReactNode;
};

export function ProfileProvider({
  initialProfile,
  children,
}: ProfileProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        setProfile(null);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        setErrorMessage(payload.message ?? "Unable to refresh profile.");
        return;
      }

      const payload = (await response.json()) as { profile: Profile | null };
      setProfile(payload.profile ?? null);
    } catch {
      setErrorMessage("Unable to refresh profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isLoading,
      errorMessage,
      refreshProfile,
    }),
    [profile, isLoading, errorMessage, refreshProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider.");
  }

  return context;
}
