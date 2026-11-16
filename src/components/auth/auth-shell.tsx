import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-auth" aria-hidden />

      <main className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-surface-card/90 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo className="[&_span]:text-text-primary" />
          <p className="mt-3 text-sm text-text-muted">
            Stronger minds. Stronger bodies.
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}
