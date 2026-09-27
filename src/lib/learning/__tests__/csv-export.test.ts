import { describe, expect, it } from "vitest";
import {
  buildClassReportRows,
  buildWordReportRows,
  exportClassReportCsv,
  exportEventReportCsv,
  exportStudentReportCsv,
  exportWordReportCsv,
  mapEventsToReportRows,
} from "@/lib/learning/csv-export";
import { SEED_CLASS } from "@/lib/seed/demo-users";
import { SEED_IDS } from "@/lib/seed/seed-ids";
import type { LearningEvent, StudentWordMastery, User, VocabularyWord } from "@/lib/types";

describe("exportClassReportCsv", () => {
  it("includes headers and comma-separated values", () => {
    const csv = exportClassReportCsv([
      {
        classId: "class-1",
        className: "Period 3",
        studentCount: 12,
        wordsMastered: 24,
        averageMasteryScore: 78.5,
        reviewCompletionRate: 65,
        studentsNeedingSupport: 3,
      },
    ]);

    expect(csv.split("\n")[0]).toBe(
      "class_id,class_name,student_count,words_mastered,average_mastery_score,review_completion_rate,students_needing_support",
    );
    expect(csv.split("\n")[1]).toBe("class-1,Period 3,12,24,78.5,65,3");
  });

  it("escapes values containing commas and quotes", () => {
    const csv = exportClassReportCsv([
      {
        classId: "class-1",
        className: 'Period 3, "A"',
        studentCount: 1,
        wordsMastered: 0,
        averageMasteryScore: 0,
        reviewCompletionRate: 0,
        studentsNeedingSupport: 0,
      },
    ]);

    expect(csv.split("\n")[1]).toBe('class-1,"Period 3, ""A""",1,0,0,0,0');
  });
});

describe("exportStudentReportCsv", () => {
  it("exports student progress columns", () => {
    const csv = exportStudentReportCsv([
      {
        studentId: "student-1",
        studentName: "Sofia Martinez",
        classId: "class-1",
        className: "Period 3",
        wordsMastered: 5,
        wordsInProgress: 3,
        averageMasteryScore: 82,
        reviewDueCount: 2,
        lastActivityAt: "2026-07-29T12:00:00.000Z",
      },
    ]);

    expect(csv.split("\n")[0]).toContain("student_id,student_name");
    expect(csv.split("\n")[1]).toContain("Sofia Martinez");
  });
});

describe("exportWordReportCsv", () => {
  it("exports vocabulary analysis columns", () => {
    const csv = exportWordReportCsv([
      {
        vocabularyWordId: "word-1",
        word: "evaporation",
        unitId: "unit-1",
        studentsAssigned: 12,
        studentsMastered: 4,
        masteryRate: 33,
        averageAttempts: 6,
        commonErrors: "omission; substitution",
      },
    ]);

    expect(csv.split("\n")[0]).toContain("vocabulary_word_id,word");
    expect(csv.split("\n")[1]).toContain("evaporation");
  });
});

describe("exportEventReportCsv", () => {
  it("exports event-level analytics", () => {
    const csv = exportEventReportCsv([
      {
        eventId: "event-1",
        timestamp: "2026-07-29T12:00:00.000Z",
        studentId: "student-1",
        classId: "class-1",
        unitId: "unit-1",
        vocabularyWordId: "word-1",
        instructionalStep: 3,
        skillCategory: "grapheme_mapping",
        isCorrect: false,
        errorCategories: "substitution",
        responseTimeMs: 2400,
        hintsUsed: 1,
      },
    ]);

    expect(csv.split("\n")[0]).toContain("event_id,timestamp");
    expect(csv.split("\n")[1]).toContain("substitution");
  });
});

describe("buildClassReportRows", () => {
  it("aggregates mastery data for class reports", () => {
    const students: User[] = [
      {
        id: SEED_IDS.users.students.sofiaMartinez,
        email: "sofia@demo.school",
        displayName: "Sofia Martinez",
        role: "student",
        isActive: true,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ];

    const mastery: StudentWordMastery[] = [
      {
        id: "m-1",
        studentId: SEED_IDS.users.students.sofiaMartinez,
        vocabularyWordId: "word-1",
        unitId: SEED_IDS.units.waterCycle,
        weightedScore: 90,
        status: "mastered",
        sessionCount: 2,
        successfulWithoutHighHint: true,
        retrievalAttemptCompleted: true,
        essentialSkillsCompleted: true,
        lastSessionAt: null,
        masteredAt: null,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      {
        id: "m-2",
        studentId: SEED_IDS.users.students.sofiaMartinez,
        vocabularyWordId: "word-2",
        unitId: SEED_IDS.units.waterCycle,
        weightedScore: 50,
        status: "needs_teacher_support",
        sessionCount: 1,
        successfulWithoutHighHint: false,
        retrievalAttemptCompleted: false,
        essentialSkillsCompleted: false,
        lastSessionAt: null,
        masteredAt: null,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ];

    const rows = buildClassReportRows([SEED_CLASS], mastery, students);

    expect(rows[0].className).toBe(SEED_CLASS.name);
    expect(rows[0].wordsMastered).toBe(1);
    expect(rows[0].studentsNeedingSupport).toBe(1);
  });
});

describe("mapEventsToReportRows", () => {
  it("joins error categories for CSV export", () => {
    const events: LearningEvent[] = [
      {
        id: "event-1",
        studentId: "student-1",
        classId: "class-1",
        unitId: "unit-1",
        vocabularyWordId: "word-1",
        sessionId: "session-1",
        attemptId: "attempt-1",
        instructionalStep: 9,
        skillCategory: "written_production",
        supportLevel: 2,
        promptShown: null,
        studentResponse: "evaportion",
        correctResponse: "evaporation",
        isCorrect: false,
        errorCategories: ["insertion", "substitution"],
        responseTimeMs: 3000,
        attemptNumber: 2,
        hintsUsed: 0,
        audioReplays: 0,
        slowAudioUsed: false,
        textToSpeechUsed: false,
        wordBankUsed: false,
        pictureSupportUsed: false,
        speechRecognitionConfidence: null,
        teacherVerified: false,
        supportDependentCorrect: false,
        completionStatus: "completed",
        deviceCategory: "chromebook",
        timestamp: "2026-07-29T12:00:00.000Z",
      },
    ];

    const rows = mapEventsToReportRows(events);

    expect(rows[0].errorCategories).toBe("insertion; substitution");
  });
});

describe("buildWordReportRows", () => {
  it("calculates mastery rate per vocabulary word", () => {
    const words: VocabularyWord[] = [
      {
        id: "word-1",
        unitId: SEED_IDS.units.waterCycle,
        word: "evaporation",
        gradeLevel: 5,
        standardsTags: [],
        studentFriendlyDefinition: "Liquid water changing into water vapor.",
        formalDefinition: "Process of vaporization.",
        pronunciationAudioUrl: null,
        syllableBreakdown: ["e", "vap", "o", "ra", "tion"],
        phonemeSequence: [],
        graphemeSequence: [],
        prefix: null,
        baseOrRoot: "evapor",
        suffix: "-ation",
        morphemeMeanings: [],
        morphologyApplicable: true,
        requiresTeacherReview: false,
        images: [],
        imageDistractorIds: [],
        definitionDistractors: [],
        exampleSentence: "Example",
        clozeSentence: "Cloze",
        applicationQuestions: [],
        commonSpellingErrors: ["evaportion"],
        commonMisconceptions: [],
        glossaryTranslations: [],
        difficultyLevel: 3,
        isActive: true,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ];

    const mastery: StudentWordMastery[] = [
      {
        id: "m-1",
        studentId: "student-1",
        vocabularyWordId: "word-1",
        unitId: SEED_IDS.units.waterCycle,
        weightedScore: 90,
        status: "mastered",
        sessionCount: 2,
        successfulWithoutHighHint: true,
        retrievalAttemptCompleted: true,
        essentialSkillsCompleted: true,
        lastSessionAt: null,
        masteredAt: null,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      {
        id: "m-2",
        studentId: "student-2",
        vocabularyWordId: "word-1",
        unitId: SEED_IDS.units.waterCycle,
        weightedScore: 50,
        status: "practicing",
        sessionCount: 1,
        successfulWithoutHighHint: false,
        retrievalAttemptCompleted: false,
        essentialSkillsCompleted: false,
        lastSessionAt: null,
        masteredAt: null,
        createdAt: "2026-07-01T00:00:00.000Z",
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ];

    const rows = buildWordReportRows(words, mastery, { "word-1": 4 });

    expect(rows[0].studentsAssigned).toBe(2);
    expect(rows[0].studentsMastered).toBe(1);
    expect(rows[0].masteryRate).toBe(50);
    expect(rows[0].averageAttempts).toBe(4);
    expect(rows[0].commonErrors).toBe("evaportion");
  });
});
