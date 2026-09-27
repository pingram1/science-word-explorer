import type {
  Class,
  ErrorCategory,
  InterventionGroup,
  InterventionGroupMember,
  LearningSession,
  ReviewSchedule,
  SkillCategory,
  StudentSupportProfile,
  StudentWordMastery,
  SupportRecommendation,
  TeacherNote,
  Unit,
  User,
  VocabularyWord,
  WordMasteryStatus,
} from "@/lib/types";

export interface TeacherDashboardFilters {
  classId?: string;
  unitId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  masteryStatus?: WordMasteryStatus;
  skillCategory?: SkillCategory;
}

export interface DashboardStats {
  totalStudents: number;
  wordsMastered: number;
  averageMastery: number;
  reviewDue: number;
  needsSupport: number;
  activeSessions: number;
}

export interface MasteryTrendPoint {
  date: string;
  label: string;
  averageScore: number;
  masteredCount: number;
}

export interface SkillProfilePoint {
  skill: SkillCategory;
  label: string;
  score: number;
}

export interface UnitProgressPoint {
  unitId: string;
  unitTitle: string;
  percentComplete: number;
  wordsMastered: number;
  totalWords: number;
}

export interface StudentTableRow {
  id: string;
  displayName: string;
  wordsMastered: number;
  wordsInProgress: number;
  averageMasteryScore: number;
  reviewDueCount: number;
  lastActivityAt: string | null;
  needsSupport: boolean;
}

export interface TeacherDashboardData {
  stats: DashboardStats;
  filterOptions: {
    classes: Class[];
    units: Unit[];
    students: User[];
    skills: SkillCategory[];
    masteryStatuses: WordMasteryStatus[];
  };
  masteryTrend: MasteryTrendPoint[];
  skillProfile: SkillProfilePoint[];
  unitProgress: UnitProgressPoint[];
  students: StudentTableRow[];
}

export interface WordStatusRow {
  vocabularyWordId: string;
  word: string;
  unitTitle: string;
  status: WordMasteryStatus;
  weightedScore: number;
  lastSessionAt: string | null;
}

export interface AccuracyTrendPoint {
  date: string;
  label: string;
  accuracy: number;
  attempts: number;
}

export interface ErrorSummaryRow {
  errorCategory: ErrorCategory;
  label: string;
  count: number;
}

export interface StudentDetailData {
  student: User;
  profile: {
    gradeLevel: number;
    defaultSupportLevel: number;
    journeyProgress: number;
  };
  progress: {
    totalWords: number;
    wordsMastered: number;
    wordsInProgress: number;
    wordsNotStarted: number;
    wordsReviewDue: number;
    percentComplete: number;
    averageMasteryScore: number;
  };
  unitProgress: UnitProgressPoint[];
  wordStatuses: WordStatusRow[];
  skillProfile: SkillProfilePoint[];
  sessions: Array<LearningSession & { word: string }>;
  accuracyTrend: AccuracyTrendPoint[];
  errorSummary: ErrorSummaryRow[];
  supportRecommendations: SupportRecommendation[];
  adaptiveExplanations: string[];
  reviewSchedules: ReviewSchedule[];
  interventionGroups: Array<
    InterventionGroup & { members: InterventionGroupMember[] }
  >;
  notes: TeacherNote[];
}

export interface WordAnalysisStudentRow {
  studentId: string;
  displayName: string;
  status: WordMasteryStatus;
  weightedScore: number;
  attemptCount: number;
  commonErrors: ErrorCategory[];
}

export interface WordAnalysisData {
  word: VocabularyWord;
  unitTitle: string;
  stats: {
    studentsAssigned: number;
    studentsMastered: number;
    masteryRate: number;
    averageAttempts: number;
    averageScore: number;
  };
  skillBreakdown: SkillProfilePoint[];
  errorHeatmap: Array<{
    instructionalStep: number;
    stepLabel: string;
    errorCount: number;
    attemptCount: number;
    errorRate: number;
  }>;
  students: WordAnalysisStudentRow[];
}

export interface InterventionGroupDetail extends InterventionGroup {
  members: Array<{ studentId: string; displayName: string }>;
}

export interface InterventionPageData {
  groups: InterventionGroupDetail[];
  students: User[];
  classes: Class[];
}

export interface SupportProfileSnapshot {
  profile: StudentSupportProfile;
  recommendations: SupportRecommendation[];
  explanations: string[];
}
