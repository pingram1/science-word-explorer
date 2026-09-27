import type {
  Assignment,
  AssignmentWord,
  Class,
  ClassMembership,
  InterventionGroup,
  InterventionGroupMember,
  LearningAttempt,
  LearningEvent,
  LearningSession,
  ReviewSchedule,
  Reward,
  StudentProfile,
  StudentReward,
  StudentSkillMastery,
  StudentSupportProfile,
  StudentWordMastery,
  TeacherNote,
  TeacherProfile,
  Unit,
  User,
  VocabularyWord,
} from "@/lib/types";

export interface DataStoreMetadata {
  version: number;
  seededAt: string;
  seedVersion: string;
}

export interface DataStore {
  metadata: DataStoreMetadata;
  users: User[];
  studentProfiles: StudentProfile[];
  teacherProfiles: TeacherProfile[];
  classes: Class[];
  classMemberships: ClassMembership[];
  units: Unit[];
  vocabularyWords: VocabularyWord[];
  studentSupportProfiles: StudentSupportProfile[];
  learningSessions: LearningSession[];
  learningAttempts: LearningAttempt[];
  learningEvents: LearningEvent[];
  studentWordMastery: StudentWordMastery[];
  studentSkillMastery: StudentSkillMastery[];
  reviewSchedules: ReviewSchedule[];
  rewards: Reward[];
  studentRewards: StudentReward[];
  interventionGroups: InterventionGroup[];
  interventionGroupMembers: InterventionGroupMember[];
  teacherNotes: TeacherNote[];
  assignments: Assignment[];
  assignmentWords: AssignmentWord[];
}

export interface LearningEventFilters {
  studentId?: string;
  classId?: string;
  unitId?: string;
  vocabularyWordId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  skillCategory?: LearningEvent["skillCategory"];
}

export interface Repository {
  // Store lifecycle
  load(): Promise<DataStore>;
  save(): Promise<void>;
  reset(store: DataStore): Promise<void>;

  // Users
  listUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  listUsersByRole(role: User["role"]): Promise<User[]>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, patch: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Student profiles
  listStudentProfiles(): Promise<StudentProfile[]>;
  getStudentProfile(id: string): Promise<StudentProfile | null>;
  getStudentProfileByUserId(userId: string): Promise<StudentProfile | null>;
  createStudentProfile(profile: StudentProfile): Promise<StudentProfile>;
  updateStudentProfile(id: string, patch: Partial<StudentProfile>): Promise<StudentProfile>;

  // Teacher profiles
  listTeacherProfiles(): Promise<TeacherProfile[]>;
  getTeacherProfile(id: string): Promise<TeacherProfile | null>;
  getTeacherProfileByUserId(userId: string): Promise<TeacherProfile | null>;
  createTeacherProfile(profile: TeacherProfile): Promise<TeacherProfile>;
  updateTeacherProfile(id: string, patch: Partial<TeacherProfile>): Promise<TeacherProfile>;

  // Classes
  listClasses(): Promise<Class[]>;
  getClass(id: string): Promise<Class | null>;
  listClassesByTeacher(teacherId: string): Promise<Class[]>;
  createClass(classRecord: Class): Promise<Class>;
  updateClass(id: string, patch: Partial<Class>): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Class memberships
  listClassMemberships(classId?: string): Promise<ClassMembership[]>;
  getClassMembership(id: string): Promise<ClassMembership | null>;
  listStudentsInClass(classId: string): Promise<User[]>;
  createClassMembership(membership: ClassMembership): Promise<ClassMembership>;
  deleteClassMembership(id: string): Promise<void>;

  // Units
  listUnits(activeOnly?: boolean): Promise<Unit[]>;
  getUnit(id: string): Promise<Unit | null>;
  getUnitBySlug(slug: string): Promise<Unit | null>;
  createUnit(unit: Unit): Promise<Unit>;
  updateUnit(id: string, patch: Partial<Unit>): Promise<Unit>;
  deleteUnit(id: string): Promise<void>;

  // Vocabulary
  listVocabularyWords(unitId?: string, activeOnly?: boolean): Promise<VocabularyWord[]>;
  getVocabularyWord(id: string): Promise<VocabularyWord | null>;
  getVocabularyWordByText(word: string): Promise<VocabularyWord | null>;
  createVocabularyWord(word: VocabularyWord): Promise<VocabularyWord>;
  updateVocabularyWord(id: string, patch: Partial<VocabularyWord>): Promise<VocabularyWord>;
  deleteVocabularyWord(id: string): Promise<void>;

  // Support profiles
  listSupportProfiles(): Promise<StudentSupportProfile[]>;
  getSupportProfile(id: string): Promise<StudentSupportProfile | null>;
  getSupportProfileByStudentId(studentId: string): Promise<StudentSupportProfile | null>;
  createSupportProfile(profile: StudentSupportProfile): Promise<StudentSupportProfile>;
  updateSupportProfile(id: string, patch: Partial<StudentSupportProfile>): Promise<StudentSupportProfile>;

  // Learning sessions
  listLearningSessions(filters?: {
    studentId?: string;
    unitId?: string;
    status?: LearningSession["status"];
  }): Promise<LearningSession[]>;
  getLearningSession(id: string): Promise<LearningSession | null>;
  createLearningSession(session: LearningSession): Promise<LearningSession>;
  updateLearningSession(id: string, patch: Partial<LearningSession>): Promise<LearningSession>;

  // Learning attempts
  listLearningAttempts(filters?: {
    sessionId?: string;
    studentId?: string;
    vocabularyWordId?: string;
  }): Promise<LearningAttempt[]>;
  getLearningAttempt(id: string): Promise<LearningAttempt | null>;
  createLearningAttempt(attempt: LearningAttempt): Promise<LearningAttempt>;

  // Learning events
  listLearningEvents(filters?: LearningEventFilters): Promise<LearningEvent[]>;
  getLearningEvent(id: string): Promise<LearningEvent | null>;
  createLearningEvent(event: LearningEvent): Promise<LearningEvent>;

  // Mastery
  listStudentWordMastery(filters?: {
    studentId?: string;
    unitId?: string;
    status?: StudentWordMastery["status"];
  }): Promise<StudentWordMastery[]>;
  getStudentWordMastery(id: string): Promise<StudentWordMastery | null>;
  getStudentWordMasteryByWord(studentId: string, vocabularyWordId: string): Promise<StudentWordMastery | null>;
  upsertStudentWordMastery(record: StudentWordMastery): Promise<StudentWordMastery>;

  listStudentSkillMastery(filters?: {
    studentId?: string;
    vocabularyWordId?: string;
  }): Promise<StudentSkillMastery[]>;
  upsertStudentSkillMastery(record: StudentSkillMastery): Promise<StudentSkillMastery>;

  // Review schedules
  listReviewSchedules(filters?: { studentId?: string; isDue?: boolean }): Promise<ReviewSchedule[]>;
  getReviewSchedule(id: string): Promise<ReviewSchedule | null>;
  createReviewSchedule(schedule: ReviewSchedule): Promise<ReviewSchedule>;
  updateReviewSchedule(id: string, patch: Partial<ReviewSchedule>): Promise<ReviewSchedule>;

  // Rewards
  listRewards(activeOnly?: boolean): Promise<Reward[]>;
  getReward(id: string): Promise<Reward | null>;
  listStudentRewards(studentId?: string): Promise<StudentReward[]>;
  createStudentReward(reward: StudentReward): Promise<StudentReward>;

  // Intervention groups
  listInterventionGroups(classId?: string): Promise<InterventionGroup[]>;
  getInterventionGroup(id: string): Promise<InterventionGroup | null>;
  createInterventionGroup(group: InterventionGroup): Promise<InterventionGroup>;
  updateInterventionGroup(id: string, patch: Partial<InterventionGroup>): Promise<InterventionGroup>;
  listInterventionGroupMembers(groupId?: string): Promise<InterventionGroupMember[]>;
  addInterventionGroupMember(member: InterventionGroupMember): Promise<InterventionGroupMember>;
  removeInterventionGroupMember(id: string): Promise<void>;

  // Teacher notes
  listTeacherNotes(filters?: { teacherId?: string; studentId?: string }): Promise<TeacherNote[]>;
  getTeacherNote(id: string): Promise<TeacherNote | null>;
  createTeacherNote(note: TeacherNote): Promise<TeacherNote>;
  updateTeacherNote(id: string, patch: Partial<TeacherNote>): Promise<TeacherNote>;
  deleteTeacherNote(id: string): Promise<void>;

  // Assignments
  listAssignments(filters?: { classId?: string; unitId?: string; status?: Assignment["status"] }): Promise<Assignment[]>;
  getAssignment(id: string): Promise<Assignment | null>;
  createAssignment(assignment: Assignment): Promise<Assignment>;
  updateAssignment(id: string, patch: Partial<Assignment>): Promise<Assignment>;
  listAssignmentWords(assignmentId?: string): Promise<AssignmentWord[]>;
  createAssignmentWord(word: AssignmentWord): Promise<AssignmentWord>;
}

export function createEmptyDataStore(): DataStore {
  return {
    metadata: {
      version: 1,
      seededAt: new Date().toISOString(),
      seedVersion: "0.0.0",
    },
    users: [],
    studentProfiles: [],
    teacherProfiles: [],
    classes: [],
    classMemberships: [],
    units: [],
    vocabularyWords: [],
    studentSupportProfiles: [],
    learningSessions: [],
    learningAttempts: [],
    learningEvents: [],
    studentWordMastery: [],
    studentSkillMastery: [],
    reviewSchedules: [],
    rewards: [],
    studentRewards: [],
    interventionGroups: [],
    interventionGroupMembers: [],
    teacherNotes: [],
    assignments: [],
    assignmentWords: [],
  };
}
