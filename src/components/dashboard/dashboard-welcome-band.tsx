import type { FitnessTabId } from "@/components/dashboard/fitness-tabs";

type DashboardWelcomeBandProps = {
  displayName: string | null;
  activeTab: FitnessTabId;
  onLogMeasurementClick?: () => void;
  logMeasurementDisabled?: boolean;
};

function WelcomeBandCta({
  activeTab,
  onLogMeasurementClick,
  logMeasurementDisabled = true,
}: {
  activeTab: FitnessTabId;
  onLogMeasurementClick?: () => void;
  logMeasurementDisabled?: boolean;
}) {
  if (activeTab === "measurements") {
    return (
      <button
        type="button"
        disabled={logMeasurementDisabled}
        aria-disabled={logMeasurementDisabled}
        onClick={onLogMeasurementClick}
        title={
          logMeasurementDisabled
            ? "Log flow ships in ticket #15"
            : undefined
        }
        className="inline-flex items-center justify-center rounded-full bg-surface-card px-5 py-2.5 text-sm font-semibold text-brand-coral shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        + Log measurement
      </button>
    );
  }

  return null;
}

export function DashboardWelcomeBand({
  displayName,
  activeTab,
  onLogMeasurementClick,
  logMeasurementDisabled = true,
}: DashboardWelcomeBandProps) {
  const greeting = displayName?.trim()
    ? `Welcome back, ${displayName.trim()}`
    : "Welcome back";

  const cta = (
    <WelcomeBandCta
      activeTab={activeTab}
      onLogMeasurementClick={onLogMeasurementClick}
      logMeasurementDisabled={logMeasurementDisabled}
    />
  );

  return (
    <section className="bg-gradient-welcome px-4 py-8 text-text-on-dark sm:px-6 sm:py-10">
      <div
        className={`mx-auto flex max-w-6xl flex-col gap-6 ${
          cta ? "md:flex-row md:items-center md:justify-between" : ""
        }`}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {greeting}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-text-on-dark/90 sm:text-base">
            Track training and baseline progress
          </p>
        </div>

        {cta ? <div className="flex shrink-0 flex-col gap-3 sm:flex-row">{cta}</div> : null}
      </div>
    </section>
  );
}
