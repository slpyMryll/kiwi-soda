export const USSC_BUDGET_CATEGORIES = [
  "Venue & Equipment Rental",
  "Meals & Snacks",
  "Honoraria & Tokens",
  "Prizes & Awards",
  "Stage & Decorations",
  "Marketing & Tarpaulins",
  "Transportation & Logistics",
  "General Office Supplies",
  "Miscellaneous / Emergency"
] as const;

export type UsscBudgetCategory = typeof USSC_BUDGET_CATEGORIES[number];