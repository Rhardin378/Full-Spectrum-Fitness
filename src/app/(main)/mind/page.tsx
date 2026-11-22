import { redirect } from "next/navigation";
import { MindHome } from "@/components/mind/mind-home";
import { createClient } from "@/lib/supabase/server";

export default async function MindPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-surface-page p-6 sm:p-10">
      <MindHome />
    </main>
  );
}
