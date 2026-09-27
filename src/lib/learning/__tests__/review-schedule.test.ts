import { describe, expect, it } from "vitest";
import {
  completeReview,
  getDueReviews,
  getUpcomingReviews,
  scheduleFullReviewSequence,
  scheduleReview,
} from "@/lib/learning/review-schedule";
import { DEFAULT_REVIEW_CONFIG } from "@/lib/constants/review";
import type { ReviewSchedule } from "@/lib/types";

const ANCHOR = new Date("2026-07-29T12:00:00.000Z");

describe("scheduleReview", () => {
  it("schedules the first interval from null previous key", () => {
    const result = scheduleReview({
      studentId: "student-1",
      vocabularyWordId: "word-1",
      anchorDate: ANCHOR,
    });

    expect(result).not.toBeNull();
    expect(result?.intervalKey).toBe("same_session");
    expect(result?.schedule.studentId).toBe("student-1");
  });

  it("advances through configured intervals", () => {
    const first = scheduleReview({
      studentId: "student-1",
      vocabularyWordId: "word-1",
      anchorDate: ANCHOR,
    });

    const second = scheduleReview({
      studentId: "student-1",
      vocabularyWordId: "word-1",
      anchorDate: ANCHOR,
      previousIntervalKey: first?.intervalKey ?? null,
    });

    expect(second?.intervalKey).toBe("one_day");
  });

  it("returns null after the final interval", () => {
    const result = scheduleReview({
      studentId: "student-1",
      vocabularyWordId: "word-1",
      anchorDate: ANCHOR,
      previousIntervalKey: "fourteen_days",
    });

    expect(result).toBeNull();
  });

  it("offsets scheduledFor by interval duration", () => {
    const result = scheduleReview({
      studentId: "student-1",
      vocabularyWordId: "word-1",
      anchorDate: ANCHOR,
      previousIntervalKey: null,
    });

    const interval = DEFAULT_REVIEW_CONFIG.intervals.find(
      (item) => item.key === "same_session",
    );
    const expected = ANCHOR.getTime() + (interval?.offsetMs ?? 0);

    expect(new Date(result!.schedule.scheduledFor).getTime()).toBe(expected);
  });
});

describe("scheduleFullReviewSequence", () => {
  it("creates all default review intervals", () => {
    const schedules = scheduleFullReviewSequence("student-1", "word-1", ANCHOR);

    expect(schedules).toHaveLength(DEFAULT_REVIEW_CONFIG.intervals.length);
    expect(schedules.map((s) => s.intervalKey)).toEqual([
      "same_session",
      "one_day",
      "three_days",
      "seven_days",
      "fourteen_days",
    ]);
  });
});

describe("getDueReviews", () => {
  const schedules: ReviewSchedule[] = [
    {
      id: "review-1",
      studentId: "student-1",
      vocabularyWordId: "word-1",
      intervalKey: "one_day",
      scheduledFor: "2026-07-28T12:00:00.000Z",
      completedAt: null,
      sessionId: null,
      isDue: true,
      createdAt: ANCHOR.toISOString(),
      updatedAt: ANCHOR.toISOString(),
    },
    {
      id: "review-2",
      studentId: "student-1",
      vocabularyWordId: "word-2",
      intervalKey: "seven_days",
      scheduledFor: "2026-08-10T12:00:00.000Z",
      completedAt: null,
      sessionId: null,
      isDue: false,
      createdAt: ANCHOR.toISOString(),
      updatedAt: ANCHOR.toISOString(),
    },
    {
      id: "review-3",
      studentId: "student-2",
      vocabularyWordId: "word-1",
      intervalKey: "one_day",
      scheduledFor: "2026-07-27T12:00:00.000Z",
      completedAt: "2026-07-28T08:00:00.000Z",
      sessionId: "session-1",
      isDue: false,
      createdAt: ANCHOR.toISOString(),
      updatedAt: ANCHOR.toISOString(),
    },
  ];

  it("returns reviews due as of a given date", () => {
    const due = getDueReviews(schedules, { asOf: new Date("2026-07-29T12:00:00.000Z") });

    expect(due).toHaveLength(1);
    expect(due[0].id).toBe("review-1");
  });

  it("filters by student and word", () => {
    const due = getDueReviews(schedules, {
      asOf: new Date("2026-07-29T12:00:00.000Z"),
      studentId: "student-1",
      vocabularyWordId: "word-1",
    });

    expect(due).toHaveLength(1);
  });

  it("can include completed reviews when requested", () => {
    const due = getDueReviews(schedules, {
      asOf: new Date("2026-07-29T12:00:00.000Z"),
      includeCompleted: true,
      studentId: "student-2",
    });

    expect(due).toHaveLength(1);
    expect(due[0].id).toBe("review-3");
  });
});

describe("completeReview", () => {
  it("marks a schedule entry completed without mutating the original", () => {
    const original: ReviewSchedule = {
      id: "review-1",
      studentId: "student-1",
      vocabularyWordId: "word-1",
      intervalKey: "one_day",
      scheduledFor: "2026-07-28T12:00:00.000Z",
      completedAt: null,
      sessionId: null,
      isDue: true,
      createdAt: ANCHOR.toISOString(),
      updatedAt: ANCHOR.toISOString(),
    };

    const completedAt = new Date("2026-07-29T09:00:00.000Z");
    const completed = completeReview(original, completedAt, "session-42");

    expect(original.completedAt).toBeNull();
    expect(completed.completedAt).toBe(completedAt.toISOString());
    expect(completed.sessionId).toBe("session-42");
    expect(completed.isDue).toBe(false);
  });
});

describe("getUpcomingReviews", () => {
  it("returns future incomplete reviews sorted by date", () => {
    const schedules: ReviewSchedule[] = [
      {
        id: "future-2",
        studentId: "student-1",
        vocabularyWordId: "word-2",
        intervalKey: "seven_days",
        scheduledFor: "2026-08-10T12:00:00.000Z",
        completedAt: null,
        sessionId: null,
        isDue: false,
        createdAt: ANCHOR.toISOString(),
        updatedAt: ANCHOR.toISOString(),
      },
      {
        id: "future-1",
        studentId: "student-1",
        vocabularyWordId: "word-1",
        intervalKey: "three_days",
        scheduledFor: "2026-08-01T12:00:00.000Z",
        completedAt: null,
        sessionId: null,
        isDue: false,
        createdAt: ANCHOR.toISOString(),
        updatedAt: ANCHOR.toISOString(),
      },
    ];

    const upcoming = getUpcomingReviews(schedules, new Date("2026-07-29T12:00:00.000Z"));

    expect(upcoming.map((item) => item.id)).toEqual(["future-1", "future-2"]);
  });
});
