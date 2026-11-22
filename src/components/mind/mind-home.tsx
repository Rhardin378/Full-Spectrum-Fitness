import Link from "next/link";

/**
 * Stub shell for `/mind`. Ticket 2.6 fills this with stats, mood trend,
 * intention card, check-in due card, and journal history.
 */
export function MindHome() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Mind</h1>
          <p className="mt-2 text-text-muted">
            Reflect across your life domains
          </p>
        </div>
        <Link
          href="/mind/journal"
          className="inline-flex items-center justify-center rounded-full bg-brand-coral px-4 py-2.5 text-sm font-semibold text-text-on-dark transition hover:bg-brand-coral-deep"
        >
          + New journal entry
        </Link>
      </header>
    </div>
  );
}
