import {
  LIFE_DOMAINS,
  REQUIRED_CHECKIN_DOMAINS,
  type LifeDomain,
  type RequiredCheckInDomain,
} from "@/lib/life-domains";

export type CheckInScores = Record<RequiredCheckInDomain, number> & {
  habits?: number | null;
};

/**
 * Lowest required score; Habits counts only when non-null.
 * Ties use canonical Option B order.
 */
export function lowestDomain(scores: CheckInScores): LifeDomain {
  let best: LifeDomain = REQUIRED_CHECKIN_DOMAINS[0];
  let bestScore = scores[REQUIRED_CHECKIN_DOMAINS[0]];

  for (const domain of REQUIRED_CHECKIN_DOMAINS) {
    const score = scores[domain];
    if (score < bestScore) {
      best = domain;
      bestScore = score;
    }
  }

  if (scores.habits != null) {
    const habitsIndex = LIFE_DOMAINS.indexOf("habits");
    const bestIndex = LIFE_DOMAINS.indexOf(best);
    if (
      scores.habits < bestScore ||
      (scores.habits === bestScore && habitsIndex < bestIndex)
    ) {
      return "habits";
    }
  }

  return best;
}
