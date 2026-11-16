import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import UpdatePasswordForm from "@/components/auth/update-password-form";
import { authPathWithReason } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export default async function UpdatePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(authPathWithReason("reset_expired"));
  }

  return (
    <AuthShell>
      <UpdatePasswordForm />
    </AuthShell>
  );
}
