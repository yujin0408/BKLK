export const ALADIN_CATEGORY_IDS = {
  business: 170,
  tech: 351,
  science: 987,
  society: 798,
  humanities: 656,
  history: 74,
  arts: 517,
  fiction: 1,
  essay: 55889,
  "self-growth": 336,
} as const;

export type AladinCategorySlug = keyof typeof ALADIN_CATEGORY_IDS;
