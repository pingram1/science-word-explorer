import {
  DEFAULT_REVIEW_CONFIG,
  getNextReviewIntervalKey,
  getReviewInterval,
  type ReviewConfig,
} from "@/lib/constants/review";
import type { ReviewIntervalKey, ReviewSchedule } from "@/lib/types";
import { generateId } from "@/lib/utils/id";

export interface ScheduleReviewInput {
  studentId: string;
  vocabularyWordId: string;
  anchorDate: Date;
  /** Previous completed interval; null schedules the first review. */
  previousIntervalKey?: ReviewIntervalKey | null;
  sessionId?: string | null;
  config?: ReviewConfig;
}

export interface ScheduleReviewResult {
  schedule: ReviewSchedule;
  intervalKey: ReviewIntervalKey;
  isFinalInterval: boolean;
}

/**
 * Schedules the next spaced-review entry for a student and word.
 * Intervals: same session → 1 day → 3 days → 7 days → 14 days.
 */
export function scheduleReview(input: ScheduleReviewInput): ScheduleReviewResult | null {
  const {
    studentId,
    vocabularyWordId,
    anchorDate,
    previousIntervalKey = null,
    sessionId = null,
    config = DEFAULT_REVIEW_CONFIG,
  } = input;

  const intervalKey = getNextReviewIntervalKey(previousIntervalKey, config);
  if (!intervalKey) {
    return null;
  }

  const interval = getReviewInterval(intervalKey, config);
  const scheduledFor = new Date(anchorDate.getTime() + interval.offsetMs);

  const schedule: ReviewSchedule = {
    id: generateId(),
    studentId,
    vocabularyWordId,
    intervalKey,
    scheduledFor: scheduledFor.toISOString(),
    completedAt: null,
    sessionId,
    isDue: scheduledFor.getTime() <= Date.now(),
    createdAt: anchorDate.toISOString(),
    updatedAt: anchorDate.toISOString(),
  };

  const nextKey = getNextReviewIntervalKey(intervalKey, config);

  return {
    schedule,
    intervalKey,
    isFinalInterval: nextKey === null,
  };
}

/**
 * Schedules the full default review sequence from an anchor date.
 */
export function scheduleFullReviewSequence(
  studentId: string,
  vocabularyWordId: string,
  anchorDate: Date,
  config: ReviewConfig = DEFAULT_REVIEW_CONFIG,
): ReviewSchedule[] {
  const schedules: ReviewSchedule[] = [];
  let previousKey: ReviewIntervalKey | null = null;

  while (true) {
    const result = scheduleReview({
      studentId,
      vocabularyWordId,
      anchorDate,
      previousIntervalKey: previousKey,
      config,
    });

    if (!result) break;

    schedules.push(result.schedule);
    previousKey = result.intervalKey;
  }

  return schedules;
}

export interface GetDueReviewsOptions {
  asOf?: Date;
  includeCompleted?: boolean;
  studentId?: string;
  vocabularyWordId?: string;
}

/**
 * Returns review schedule entries that are due as of the given date.
 */
export function getDueReviews(
  schedules: ReviewSchedule[],
  options: GetDueReviewsOptions = {},
): ReviewSchedule[] {
  const {
    asOf = new Date(),
    includeCompleted = false,
    studentId,
    vocabularyWordId,
  } = options;

  const asOfTime = asOf.getTime();

  return schedules
    .filter((schedule) => {
      if (!includeCompleted && schedule.completedAt !== null) {
        return false;
      }
      if (studentId && schedule.studentId !== studentId) {
        return false;
      }
      if (vocabularyWordId && schedule.vocabularyWordId !== vocabularyWordId) {
        return false;
      }
      return new Date(schedule.scheduledFor).getTime() <= asOfTime;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
    );
}

/** Marks a review schedule entry as completed. Returns a new object (pure). */
export function completeReview(
  schedule: ReviewSchedule,
  completedAt: Date = new Date(),
  sessionId?: string | null,
): ReviewSchedule {
  return {
    ...schedule,
    completedAt: completedAt.toISOString(),
    sessionId: sessionId ?? schedule.sessionId,
    isDue: false,
    updatedAt: completedAt.toISOString(),
  };
}

/** Returns upcoming reviews that are not yet due. */
export function getUpcomingReviews(
  schedules: ReviewSchedule[],
  asOf: Date = new Date(),
): ReviewSchedule[] {
  const asOfTime = asOf.getTime();

  return schedules
    .filter(
      (schedule) =>
        schedule.completedAt === null &&
        new Date(schedule.scheduledFor).getTime() > asOfTime,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime(),
    );
}
