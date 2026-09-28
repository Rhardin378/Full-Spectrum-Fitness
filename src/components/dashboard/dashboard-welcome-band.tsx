type DashboardWelcomeBandProps = {
  displayName: string | null;
};

export function DashboardWelcomeBand({ displayName }: DashboardWelcomeBandProps) {
  const greeting = displayName?.trim()
    ? `Welcome back, ${displayName.trim()}`
    : "Welcome back";

  return (
    <section className="bg-gradient-welcome px-4 py-8 text-text-on-dark sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-text-on-dark/90 sm:text-base">
            Track training and baseline progress
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Available in a future update"
            className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-surface-card px-5 py-2.5 text-sm font-semibold text-brand-coral opacity-60 shadow-sm"
          >
            + Log workout
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Available in Slice 1.5 UI (#15)"
            className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-text-on-dark opacity-60 backdrop-blur-sm"
          >
            + Log measurement
          </button>
        </div>
      </div>
    </section>
  );
}
