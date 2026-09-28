"use client";

import { useState } from "react";

const FITNESS_TABS = [
  { id: "overview", label: "Overview", comingSoon: true },
  { id: "workouts", label: "Workouts", comingSoon: true },
  { id: "measurements", label: "Measurements", comingSoon: false },
  { id: "library", label: "Library", comingSoon: true },
] as const;

type FitnessTabId = (typeof FITNESS_TABS)[number]["id"];

function TabButton({
  label,
  active,
  comingSoon,
  onSelect,
}: {
  label: string;
  active: boolean;
  comingSoon: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={`relative shrink-0 px-1 pb-3 pt-4 text-sm font-medium transition ${
        active
          ? "text-text-primary"
          : comingSoon
            ? "text-text-muted/80 hover:text-text-muted"
            : "text-text-muted hover:text-text-primary"
      }`}
    >
      {label}
      {comingSoon && !active ? (
        <span className="sr-only"> (coming soon)</span>
      ) : null}
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-coral"
        />
      ) : null}
    </button>
  );
}

function ComingSoonPanel({ tabLabel }: { tabLabel: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-surface-card p-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-text-primary">{tabLabel}</p>
      <p className="mt-2 text-sm text-text-muted">
        This area is on the way. Measurements is your home for baseline
        tracking in this release.
      </p>
    </div>
  );
}

function MeasurementsShellPanel() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section
        className="rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm"
        aria-labelledby="recent-history-heading"
      >
        <h2
          id="recent-history-heading"
          className="text-lg font-semibold text-text-primary"
        >
          Recent history
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          Your weight and waist entries will show up here. Log your first
          measurement when the entry flow ships — you are building a clear
          picture of progress, not chasing perfection.
        </p>
      </section>

      <section
        className="rounded-2xl border border-black/5 bg-surface-card p-6 shadow-sm"
        aria-labelledby="weight-trend-heading"
      >
        <h2
          id="weight-trend-heading"
          className="text-lg font-semibold text-text-primary"
        >
          Weight trend
        </h2>
        <p className="mt-1 text-xs text-text-muted">Last 30 days</p>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          A simple trend view will appear here once you have measurements saved.
          For now, this card reserves space for the chart in ticket #16.
        </p>
      </section>
    </div>
  );
}

export default function FitnessDashboardShell() {
  const [activeTab, setActiveTab] = useState<FitnessTabId>("measurements");

  const activeTabMeta = FITNESS_TABS.find((tab) => tab.id === activeTab)!;

  function selectTab(tabId: FitnessTabId) {
    setActiveTab(tabId);
  }

  return (
    <div className="bg-surface-page">
      <div
        role="tablist"
        aria-label="Fitness"
        className="border-b border-black/5 bg-surface-card"
      >
        <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 sm:gap-8 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FITNESS_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              comingSoon={tab.comingSoon}
              onSelect={() => selectTab(tab.id)}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === "measurements" ? (
          <MeasurementsShellPanel />
        ) : (
          <ComingSoonPanel tabLabel={activeTabMeta.label} />
        )}
      </div>
    </div>
  );
}
