"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { DashboardWelcomeBand } from "@/components/dashboard/dashboard-welcome-band";
import { FITNESS_TABS, type FitnessTabId } from "@/components/dashboard/fitness-tabs";
import { LogMeasurementModal } from "@/components/measurements/log-measurement-modal";
import { MeasurementsTabPanel } from "@/components/measurements/measurements-tab-panel";

type FitnessDashboardShellProps = {
  displayName: string | null;
  needsProfileSetup?: boolean;
};

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

export default function FitnessDashboardShell({
  displayName,
  needsProfileSetup = false,
}: FitnessDashboardShellProps) {
  const [activeTab, setActiveTab] = useState<FitnessTabId>("measurements");
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logModalKey, setLogModalKey] = useState(0);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const openLogModal = useCallback(() => {
    setLogModalKey((key) => key + 1);
    setLogModalOpen(true);
  }, []);
  const closeLogModal = useCallback(() => setLogModalOpen(false), []);
  const handleMeasurementSaved = useCallback(() => {
    setHistoryRefreshToken((token) => token + 1);
    setShowSaveSuccess(true);
    window.setTimeout(() => setShowSaveSuccess(false), 5000);
  }, []);

  const activeTabMeta = FITNESS_TABS.find((tab) => tab.id === activeTab)!;

  return (
    <>
      <DashboardWelcomeBand
        displayName={displayName}
        activeTab={activeTab}
        onLogMeasurementClick={openLogModal}
        logMeasurementDisabled={false}
      />

      <LogMeasurementModal
        key={logModalKey}
        open={logModalOpen}
        onClose={closeLogModal}
        onSaved={handleMeasurementSaved}
      />

      {needsProfileSetup ? (
        <div className="border-b border-black/5 bg-surface-card px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Complete your profile to personalize welcome copy and goals.
            </p>
            <Link
              href="/profile"
              className="inline-flex text-sm font-semibold text-brand-coral hover:text-brand-coral-deep"
            >
              Complete profile setup →
            </Link>
          </div>
        </div>
      ) : null}

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
                onSelect={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {activeTab === "measurements" ? (
            <MeasurementsTabPanel
              onLogMeasurementClick={openLogModal}
              refreshToken={historyRefreshToken}
              showSaveSuccess={showSaveSuccess}
            />
          ) : (
            <ComingSoonPanel tabLabel={activeTabMeta.label} />
          )}
        </div>
      </div>
    </>
  );
}
