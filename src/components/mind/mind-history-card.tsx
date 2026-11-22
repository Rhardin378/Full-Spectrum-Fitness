import { formatJournalDay } from "@/lib/journal/display";
import type { JournalEntry } from "@/lib/journal/types";
import { LIFE_DOMAIN_LABELS } from "@/lib/life-domains";

type MindHistoryCardProps = {
  entry: JournalEntry;
};

export function MindHistoryCard({ entry }: MindHistoryCardProps) {
  return (
    <article className="rounded-2xl border border-black/5 bg-surface-card px-4 py-4 shadow-sm sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary">
          {formatJournalDay(entry.entry_on)}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-brand-coral-light px-2.5 py-0.5 text-xs font-semibold text-brand-coral-deep">
            Mood {entry.mood}
          </span>
          {entry.stress != null ? (
            <span className="rounded-full bg-surface-page px-2.5 py-0.5 text-xs font-medium text-text-muted">
              Stress {entry.stress}
            </span>
          ) : null}
          {entry.energy != null ? (
            <span className="rounded-full bg-surface-page px-2.5 py-0.5 text-xs font-medium text-text-muted">
              Energy {entry.energy}
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-text-primary">
        {entry.reflection}
      </p>

      {entry.win ? (
        <p className="mt-3 text-sm text-text-muted">
          <span className="font-medium text-text-primary">One win today</span>
          <span className="mt-0.5 block text-text-primary">{entry.win}</span>
        </p>
      ) : null}

      {entry.grateful_for ? (
        <p className="mt-3 text-sm text-text-muted">
          <span className="font-medium text-text-primary">Grateful for</span>
          <span className="mt-0.5 block text-text-primary">
            {entry.grateful_for}
          </span>
        </p>
      ) : null}

      {entry.domains.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {entry.domains.map((domain) => (
            <li
              key={domain}
              className="rounded-full border border-black/10 bg-surface-page px-2.5 py-0.5 text-xs font-medium text-text-muted"
            >
              {LIFE_DOMAIN_LABELS[domain]}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
