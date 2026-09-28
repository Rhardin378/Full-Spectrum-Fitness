export const FITNESS_TABS = [
  { id: "overview", label: "Overview", comingSoon: true },
  { id: "workouts", label: "Workouts", comingSoon: true },
  { id: "measurements", label: "Measurements", comingSoon: false },
  { id: "library", label: "Library", comingSoon: true },
] as const;

export type FitnessTabId = (typeof FITNESS_TABS)[number]["id"];
