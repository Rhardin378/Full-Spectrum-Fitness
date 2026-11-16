import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { DEFAULT_SIGNED_IN_PATH, getAuthReasonMessage } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

type AuthPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(DEFAULT_SIGNED_IN_PATH);
  }

  const { reason } = await searchParams;
  const reasonMessage = getAuthReasonMessage(reason);
  const initialMode =
    reason === "link_invalid" || reason === "reset_expired" ? "forgot" : "signin";

  return (
    <AuthShell>
      <AuthForm initialMode={initialMode} reasonMessage={reasonMessage} />
    </AuthShell>
  );
}
