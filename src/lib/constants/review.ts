import type { ReviewIntervalKey } from "@/lib/types";

export interface ReviewInterval {
  key: ReviewIntervalKey;
  label: string;
  /** Offset in milliseconds from the anchor date. */
  offsetMs: number;
  sortOrder: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Default spaced-review intervals from the product spec. */
export const DEFAULT_REVIEW_INTERVALS: readonly ReviewInterval[] = [
  {
    key: "same_session",
    label: "Later in the same session",
    offsetMs: 15 * 60 * 1000,
    sortOrder: 0,
  },
  {
    key: "one_day",
    label: "Next available school day",
    offsetMs: 1 * DAY_MS,
    sortOrder: 1,
  },
  {
    key: "three_days",
    label: "Three days later",
    offsetMs: 3 * DAY_MS,
    sortOrder: 2,
  },
  {
    key: "seven_days",
    label: "Seven days later",
    offsetMs: 7 * DAY_MS,
    sortOrder: 3,
  },
  {
    key: "fourteen_days",
    label: "Fourteen days later",
    offsetMs: 14 * DAY_MS,
    sortOrder: 4,
  },
] as const;

export interface ReviewConfig {
  intervals: readonly ReviewInterval[];
}

export const DEFAULT_REVIEW_CONFIG: ReviewConfig = {
  intervals: DEFAULT_REVIEW_INTERVALS,
};

/** Returns the next review interval after the given key, or null if complete. */
export function getNextReviewIntervalKey(
  current: ReviewIntervalKey | null,
  config: ReviewConfig = DEFAULT_REVIEW_CONFIG,
): ReviewIntervalKey | null {
  const sorted = [...config.intervals].sort((a, b) => a.sortOrder - b.sortOrder);

  if (current === null) {
    return sorted[0]?.key ?? null;
  }

  const currentIndex = sorted.findIndex((interval) => interval.key === current);
  if (currentIndex === -1 || currentIndex >= sorted.length - 1) {
    return null;
  }

  return sorted[currentIndex + 1].key;
}

/** Looks up interval configuration by key. */
export function getReviewInterval(
  key: ReviewIntervalKey,
  config: ReviewConfig = DEFAULT_REVIEW_CONFIG,
): ReviewInterval {
  const interval = config.intervals.find((item) => item.key === key);
  if (!interval) {
    throw new Error(`Unknown review interval key: ${key}`);
  }
  return interval;
}
