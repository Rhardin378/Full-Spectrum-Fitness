export const FITNESS_TABS = [
  { id: "overview", label: "Overview", comingSoon: true },
  { id: "workouts", label: "Workouts", comingSoon: true },
  { id: "measurements", label: "Measurements", comingSoon: false },
  { id: "library", label: "Library", comingSoon: true },
] as const;

export type FitnessTabId = (typeof FITNESS_TABS)[number]["id"];

/** Until OV.1, `/fitness` selects Measurements (not Overview). */
export function fitnessTabFromPathname(pathname: string): FitnessTabId {
  if (pathname.startsWith("/fitness/workouts")) return "workouts";
  if (pathname.startsWith("/fitness/library")) return "library";
  if (pathname.startsWith("/fitness/measurements")) return "measurements";
  return "measurements";
}

export function pathForFitnessTab(tab: FitnessTabId): string {
  switch (tab) {
    case "overview":
      return "/fitness";
    case "measurements":
      return "/fitness/measurements";
    case "workouts":
      return "/fitness/workouts";
    case "library":
      return "/fitness/library";
  }
}
