"use server";

import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { normalizeProfile } from "@/lib/profile/normalize";
import {
  formatProfileValidationErrors,
  profileUpdateSchema,
  toProfileUpdatePayload,
} from "@/lib/profile/validation";
import type { Profile, ProfileUpdate } from "@/lib/types/profile";

export type GetOrCreateProfileResult =
  | { success: true; profile: Profile }
  | { success: false; error: "unauthorized" | "database"; message: string };

export type UpdateProfileResult =
  | { success: true; profile: Profile }
  | {
      success: false;
      error: "unauthorized" | "validation" | "not_found" | "database";
      message: string;
      fieldErrors?: Record<string, string>;
    };

const PROFILE_COLUMNS =
  "id, user_id, display_name, fitness_goal, wellness_goal, experience_level, sharing_preferences, domain_priorities, created_at, updated_at";

function getDefaultDisplayName(user: User): string | null {
  const fromMetadata =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";

  if (fromMetadata.length >= 1 && fromMetadata.length <= 100) {
    return fromMetadata;
  }

  const fromEmail = user.email?.split("@")[0]?.trim();
  if (fromEmail && fromEmail.length >= 1 && fromEmail.length <= 100) {
    return fromEmail;
  }

  return null;
}

async function fetchProfileByUserId(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();
}

export async function getOrCreateProfile(): Promise<GetOrCreateProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to access your profile.",
    };
  }

  const { data: existingProfile, error: selectError } =
    await fetchProfileByUserId(user.id);

  if (selectError) {
    return {
      success: false,
      error: "database",
      message: selectError.message,
    };
  }

  if (existingProfile) {
    return {
      success: true,
      profile: normalizeProfile(existingProfile),
    };
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      display_name: getDefaultDisplayName(user),
      domain_priorities: [],
    })
    .select(PROFILE_COLUMNS)
    .single();

  if (!insertError && createdProfile) {
    return {
      success: true,
      profile: normalizeProfile(createdProfile),
    };
  }

  if (insertError?.code === "23505") {
    const { data: racedProfile, error: retryError } =
      await fetchProfileByUserId(user.id);

    if (!retryError && racedProfile) {
      return {
        success: true,
        profile: normalizeProfile(racedProfile),
      };
    }

    if (retryError) {
      return {
        success: false,
        error: "database",
        message: retryError.message,
      };
    }
  }

  return {
    success: false,
    error: "database",
    message: insertError?.message ?? "Failed to create profile.",
  };
}

export async function updateProfile(
  input: ProfileUpdate,
): Promise<UpdateProfileResult> {
  const parsed = profileUpdateSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = formatProfileValidationErrors(parsed.error);

    return {
      success: false,
      error: "validation",
      message: fieldErrors._form ?? "Please fix the highlighted profile fields.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "unauthorized",
      message: "You must be signed in to update your profile.",
    };
  }

  const updatePayload = toProfileUpdatePayload(parsed.data);

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("user_id", user.id)
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (updateError) {
    return {
      success: false,
      error: "database",
      message: updateError.message,
    };
  }

  if (!updatedProfile) {
    return {
      success: false,
      error: "not_found",
      message: "Profile not found. Refresh the page and try again.",
    };
  }

  return {
    success: true,
    profile: normalizeProfile(updatedProfile),
  };
}
