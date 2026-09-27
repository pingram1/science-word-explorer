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
import type { DataStore, LearningEventFilters, Repository } from "@/lib/repositories/types";
import { createEmptyDataStore } from "@/lib/repositories/types";
import {
  loadStoreFromDisk,
  saveStoreToDisk,
  setCachedStore,
} from "@/lib/repositories/local-store";

function notFound<T>(entity: string, id: string): T {
  throw new Error(`${entity} not found: ${id}`);
}

function withinDateRange(timestamp: string, startDate?: string, endDate?: string): boolean {
  if (startDate && timestamp < startDate) return false;
  if (endDate && timestamp > endDate) return false;
  return true;
}

export class LocalRepository implements Repository {
  private store: DataStore = createEmptyDataStore();

  async load(): Promise<DataStore> {
    this.store = await loadStoreFromDisk();
    return this.store;
  }

  async save(): Promise<void> {
    await saveStoreToDisk(this.store);
  }

  async reset(store: DataStore): Promise<void> {
    this.store = store;
    setCachedStore(store);
    await saveStoreToDisk(store);
  }

  private async ensureLoaded(): Promise<void> {
    // Always reconcile with disk so sibling Next.js workers see new sessions.
    this.store = await loadStoreFromDisk();
  }

  private touch<T extends { updatedAt?: string }>(record: T): T {
    return { ...record, updatedAt: new Date().toISOString() };
  }

  async listUsers(): Promise<User[]> {
    await this.ensureLoaded();
    return [...this.store.users];
  }

  async getUser(id: string): Promise<User | null> {
    await this.ensureLoaded();
    return this.store.users.find((user) => user.id === id) ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureLoaded();
    return this.store.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async listUsersByRole(role: User["role"]): Promise<User[]> {
    await this.ensureLoaded();
    return this.store.users.filter((user) => user.role === role);
  }

  async createUser(user: User): Promise<User> {
    await this.ensureLoaded();
    this.store.users.push(user);
    await this.save();
    return user;
  }

  async updateUser(id: string, patch: Partial<User>): Promise<User> {
    await this.ensureLoaded();
    const index = this.store.users.findIndex((user) => user.id === id);
    if (index === -1) notFound("User", id);
    this.store.users[index] = this.touch({ ...this.store.users[index], ...patch });
    await this.save();
    return this.store.users[index];
  }

  async deleteUser(id: string): Promise<void> {
    await this.ensureLoaded();
    this.store.users = this.store.users.filter((user) => user.id !== id);
    await this.save();
  }

  async listStudentProfiles(): Promise<StudentProfile[]> {
    await this.ensureLoaded();
    return [...this.store.studentProfiles];
  }

  async getStudentProfile(id: string): Promise<StudentProfile | null> {
    await this.ensureLoaded();
    return this.store.studentProfiles.find((profile) => profile.id === id) ?? null;
  }

  async getStudentProfileByUserId(userId: string): Promise<StudentProfile | null> {
    await this.ensureLoaded();
    return this.store.studentProfiles.find((profile) => profile.userId === userId) ?? null;
  }

  async createStudentProfile(profile: StudentProfile): Promise<StudentProfile> {
    await this.ensureLoaded();
    this.store.studentProfiles.push(profile);
    await this.save();
    return profile;
  }

  async updateStudentProfile(id: string, patch: Partial<StudentProfile>): Promise<StudentProfile> {
    await this.ensureLoaded();
    const index = this.store.studentProfiles.findIndex((profile) => profile.id === id);
    if (index === -1) notFound("StudentProfile", id);
    this.store.studentProfiles[index] = this.touch({ ...this.store.studentProfiles[index], ...patch });
    await this.save();
    return this.store.studentProfiles[index];
  }

  async listTeacherProfiles(): Promise<TeacherProfile[]> {
    await this.ensureLoaded();
    return [...this.store.teacherProfiles];
  }

  async getTeacherProfile(id: string): Promise<TeacherProfile | null> {
    await this.ensureLoaded();
    return this.store.teacherProfiles.find((profile) => profile.id === id) ?? null;
  }

  async getTeacherProfileByUserId(userId: string): Promise<TeacherProfile | null> {
    await this.ensureLoaded();
    return this.store.teacherProfiles.find((profile) => profile.userId === userId) ?? null;
  }

  async createTeacherProfile(profile: TeacherProfile): Promise<TeacherProfile> {
    await this.ensureLoaded();
    this.store.teacherProfiles.push(profile);
    await this.save();
    return profile;
  }

  async updateTeacherProfile(id: string, patch: Partial<TeacherProfile>): Promise<TeacherProfile> {
    await this.ensureLoaded();
    const index = this.store.teacherProfiles.findIndex((profile) => profile.id === id);
    if (index === -1) notFound("TeacherProfile", id);
    this.store.teacherProfiles[index] = this.touch({ ...this.store.teacherProfiles[index], ...patch });
    await this.save();
    return this.store.teacherProfiles[index];
  }

  async listClasses(): Promise<Class[]> {
    await this.ensureLoaded();
    return [...this.store.classes];
  }

  async getClass(id: string): Promise<Class | null> {
    await this.ensureLoaded();
    return this.store.classes.find((classRecord) => classRecord.id === id) ?? null;
  }

  async listClassesByTeacher(teacherId: string): Promise<Class[]> {
    await this.ensureLoaded();
    return this.store.classes.filter((classRecord) => classRecord.teacherId === teacherId);
  }

  async createClass(classRecord: Class): Promise<Class> {
    await this.ensureLoaded();
    this.store.classes.push(classRecord);
    await this.save();
    return classRecord;
  }

  async updateClass(id: string, patch: Partial<Class>): Promise<Class> {
    await this.ensureLoaded();
    const index = this.store.classes.findIndex((classRecord) => classRecord.id === id);
    if (index === -1) notFound("Class", id);
    this.store.classes[index] = this.touch({ ...this.store.classes[index], ...patch });
    await this.save();
    return this.store.classes[index];
  }

  async deleteClass(id: string): Promise<void> {
    await this.ensureLoaded();
    this.store.classes = this.store.classes.filter((classRecord) => classRecord.id !== id);
    await this.save();
  }

  async listClassMemberships(classId?: string): Promise<ClassMembership[]> {
    await this.ensureLoaded();
    return this.store.classMemberships.filter((membership) => !classId || membership.classId === classId);
  }

  async getClassMembership(id: string): Promise<ClassMembership | null> {
    await this.ensureLoaded();
    return this.store.classMemberships.find((membership) => membership.id === id) ?? null;
  }

  async listStudentsInClass(classId: string): Promise<User[]> {
    await this.ensureLoaded();
    const studentIds = this.store.classMemberships
      .filter((membership) => membership.classId === classId && membership.role === "student")
      .map((membership) => membership.userId);
    return this.store.users.filter((user) => studentIds.includes(user.id));
  }

  async createClassMembership(membership: ClassMembership): Promise<ClassMembership> {
    await this.ensureLoaded();
    this.store.classMemberships.push(membership);
    await this.save();
    return membership;
  }

  async deleteClassMembership(id: string): Promise<void> {
    await this.ensureLoaded();
    this.store.classMemberships = this.store.classMemberships.filter((membership) => membership.id !== id);
    await this.save();
  }

  async listUnits(activeOnly = false): Promise<Unit[]> {
    await this.ensureLoaded();
    return this.store.units
      .filter((unit) => !activeOnly || unit.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getUnit(id: string): Promise<Unit | null> {
    await this.ensureLoaded();
    return this.store.units.find((unit) => unit.id === id) ?? null;
  }

  async getUnitBySlug(slug: string): Promise<Unit | null> {
    await this.ensureLoaded();
    return this.store.units.find((unit) => unit.slug === slug) ?? null;
  }

  async createUnit(unit: Unit): Promise<Unit> {
    await this.ensureLoaded();
    this.store.units.push(unit);
    await this.save();
    return unit;
  }

  async updateUnit(id: string, patch: Partial<Unit>): Promise<Unit> {
    await this.ensureLoaded();
    const index = this.store.units.findIndex((unit) => unit.id === id);
    if (index === -1) notFound("Unit", id);
    this.store.units[index] = this.touch({ ...this.store.units[index], ...patch });
    await this.save();
    return this.store.units[index];
  }

  async deleteUnit(id: string): Promise<void> {
    await this.ensureLoaded();
    this.store.units = this.store.units.filter((unit) => unit.id !== id);
    await this.save();
  }

  async listVocabularyWords(unitId?: string, activeOnly = false): Promise<VocabularyWord[]> {
    await this.ensureLoaded();
    return this.store.vocabularyWords.filter(
      (word) => (!unitId || word.unitId === unitId) && (!activeOnly || word.isActive),
    );
  }

  async getVocabularyWord(id: string): Promise<VocabularyWord | null> {
    await this.ensureLoaded();
    return this.store.vocabularyWords.find((word) => word.id === id) ?? null;
  }

  async getVocabularyWordByText(word: string): Promise<VocabularyWord | null> {
    await this.ensureLoaded();
    return (
      this.store.vocabularyWords.find(
        (entry) => entry.word.toLowerCase() === word.toLowerCase(),
      ) ?? null
    );
  }

  async createVocabularyWord(word: VocabularyWord): Promise<VocabularyWord> {
    await this.ensureLoaded();
    this.store.vocabularyWords.push(word);
    await this.save();
    return word;
  }

  async updateVocabularyWord(id: string, patch: Partial<VocabularyWord>): Promise<VocabularyWord> {
    await this.ensureLoaded();
    const index = this.store.vocabularyWords.findIndex((word) => word.id === id);
    if (index === -1) notFound("VocabularyWord", id);
    this.store.vocabularyWords[index] = this.touch({ ...this.store.vocabularyWords[index], ...patch });
    await this.save();
    return this.store.vocabularyWords[index];
  }

  async deleteVocabularyWord(id: string): Promise<void> {
    await this.ensureLoaded();
    this.store.vocabularyWords = this.store.vocabularyWords.filter((word) => word.id !== id);
    await this.save();
  }

  async listSupportProfiles(): Promise<StudentSupportProfile[]> {
    await this.ensureLoaded();
    return [...this.store.studentSupportProfiles];
  }

  async getSupportProfile(id: string): Promise<StudentSupportProfile | null> {
    await this.ensureLoaded();
    return this.store.studentSupportProfiles.find((profile) => profile.id === id) ?? null;
  }

  async getSupportProfileByStudentId(studentId: string): Promise<StudentSupportProfile | null> {
    await this.ensureLoaded();
    return this.store.studentSupportProfiles.find((profile) => profile.studentId === studentId) ?? null;
  }

  async createSupportProfile(profile: StudentSupportProfile): Promise<StudentSupportProfile> {
    await this.ensureLoaded();
    this.store.studentSupportProfiles.push(profile);
    await this.save();
    return profile;
  }

  async updateSupportProfile(id: string, patch: Partial<StudentSupportProfile>): Promise<StudentSupportProfile> {
    await this.ensureLoaded();
    const index = this.store.studentSupportProfiles.findIndex((profile) => profile.id === id);
    if (index === -1) notFound("StudentSupportProfile", id);
    this.store.studentSupportProfiles[index] = this.touch({
      ...this.store.studentSupportProfiles[index],
      ...patch,
    });
    await this.save();
    return this.store.studentSupportProfiles[index];
  }

  async listLearningSessions(filters?: {
    studentId?: string;
    unitId?: string;
    status?: LearningSession["status"];
  }): Promise<LearningSession[]> {
    await this.ensureLoaded();
    return this.store.learningSessions.filter((session) => {
      if (filters?.studentId && session.studentId !== filters.studentId) return false;
      if (filters?.unitId && session.unitId !== filters.unitId) return false;
      if (filters?.status && session.status !== filters.status) return false;
      return true;
    });
  }

  async getLearningSession(id: string): Promise<LearningSession | null> {
    await this.ensureLoaded();
    return this.store.learningSessions.find((session) => session.id === id) ?? null;
  }

  async createLearningSession(session: LearningSession): Promise<LearningSession> {
    await this.ensureLoaded();
    this.store.learningSessions.push(session);
    await this.save();
    return session;
  }

  async updateLearningSession(id: string, patch: Partial<LearningSession>): Promise<LearningSession> {
    await this.ensureLoaded();
    const index = this.store.learningSessions.findIndex((session) => session.id === id);
    if (index === -1) notFound("LearningSession", id);
    this.store.learningSessions[index] = this.touch({ ...this.store.learningSessions[index], ...patch });
    await this.save();
    return this.store.learningSessions[index];
  }

  async listLearningAttempts(filters?: {
    sessionId?: string;
    studentId?: string;
    vocabularyWordId?: string;
  }): Promise<LearningAttempt[]> {
    await this.ensureLoaded();
    return this.store.learningAttempts.filter((attempt) => {
      if (filters?.sessionId && attempt.sessionId !== filters.sessionId) return false;
      if (filters?.studentId && attempt.studentId !== filters.studentId) return false;
      if (filters?.vocabularyWordId && attempt.vocabularyWordId !== filters.vocabularyWordId) return false;
      return true;
    });
  }

  async getLearningAttempt(id: string): Promise<LearningAttempt | null> {
    await this.ensureLoaded();
    return this.store.learningAttempts.find((attempt) => attempt.id === id) ?? null;
  }

  async createLearningAttempt(attempt: LearningAttempt): Promise<LearningAttempt> {
    await this.ensureLoaded();
    this.store.learningAttempts.push(attempt);
    await this.save();
    return attempt;
  }

  async listLearningEvents(filters?: LearningEventFilters): Promise<LearningEvent[]> {
    await this.ensureLoaded();
    return this.store.learningEvents.filter((event) => {
      if (filters?.studentId && event.studentId !== filters.studentId) return false;
      if (filters?.classId && event.classId !== filters.classId) return false;
      if (filters?.unitId && event.unitId !== filters.unitId) return false;
      if (filters?.vocabularyWordId && event.vocabularyWordId !== filters.vocabularyWordId) return false;
      if (filters?.sessionId && event.sessionId !== filters.sessionId) return false;
      if (filters?.skillCategory && event.skillCategory !== filters.skillCategory) return false;
      if (!withinDateRange(event.timestamp, filters?.startDate, filters?.endDate)) return false;
      return true;
    });
  }

  async getLearningEvent(id: string): Promise<LearningEvent | null> {
    await this.ensureLoaded();
    return this.store.learningEvents.find((event) => event.id === id) ?? null;
  }

  async createLearningEvent(event: LearningEvent): Promise<LearningEvent> {
    await this.ensureLoaded();
    this.store.learningEvents.push(event);
    await this.save();
    return event;
  }

  async listStudentWordMastery(filters?: {
    studentId?: string;
    unitId?: string;
    status?: StudentWordMastery["status"];
  }): Promise<StudentWordMastery[]> {
    await this.ensureLoaded();
    return this.store.studentWordMastery.filter((record) => {
      if (filters?.studentId && record.studentId !== filters.studentId) return false;
      if (filters?.unitId && record.unitId !== filters.unitId) return false;
      if (filters?.status && record.status !== filters.status) return false;
      return true;
    });
  }

  async getStudentWordMastery(id: string): Promise<StudentWordMastery | null> {
    await this.ensureLoaded();
    return this.store.studentWordMastery.find((record) => record.id === id) ?? null;
  }

  async getStudentWordMasteryByWord(
    studentId: string,
    vocabularyWordId: string,
  ): Promise<StudentWordMastery | null> {
    await this.ensureLoaded();
    return (
      this.store.studentWordMastery.find(
        (record) => record.studentId === studentId && record.vocabularyWordId === vocabularyWordId,
      ) ?? null
    );
  }

  async upsertStudentWordMastery(record: StudentWordMastery): Promise<StudentWordMastery> {
    await this.ensureLoaded();
    const index = this.store.studentWordMastery.findIndex((item) => item.id === record.id);
    if (index === -1) {
      this.store.studentWordMastery.push(record);
    } else {
      this.store.studentWordMastery[index] = this.touch({ ...this.store.studentWordMastery[index], ...record });
    }
    await this.save();
    return record;
  }

  async listStudentSkillMastery(filters?: {
    studentId?: string;
    vocabularyWordId?: string;
  }): Promise<StudentSkillMastery[]> {
    await this.ensureLoaded();
    return this.store.studentSkillMastery.filter((record) => {
      if (filters?.studentId && record.studentId !== filters.studentId) return false;
      if (filters?.vocabularyWordId && record.vocabularyWordId !== filters.vocabularyWordId) return false;
      return true;
    });
  }

  async upsertStudentSkillMastery(record: StudentSkillMastery): Promise<StudentSkillMastery> {
    await this.ensureLoaded();
    const index = this.store.studentSkillMastery.findIndex((item) => item.id === record.id);
    if (index === -1) {
      this.store.studentSkillMastery.push(record);
    } else {
      this.store.studentSkillMastery[index] = this.touch({ ...this.store.studentSkillMastery[index], ...record });
    }
    await this.save();
    return record;
  }

  async listReviewSchedules(filters?: { studentId?: string; isDue?: boolean }): Promise<ReviewSchedule[]> {
    await this.ensureLoaded();
    return this.store.reviewSchedules.filter((schedule) => {
      if (filters?.studentId && schedule.studentId !== filters.studentId) return false;
      if (filters?.isDue !== undefined && schedule.isDue !== filters.isDue) return false;
      return true;
    });
  }

  async getReviewSchedule(id: string): Promise<ReviewSchedule | null> {
    await this.ensureLoaded();
    return this.store.reviewSchedules.find((schedule) => schedule.id === id) ?? null;
  }

  async createReviewSchedule(schedule: ReviewSchedule): Promise<ReviewSchedule> {
    await this.ensureLoaded();
    this.store.reviewSchedules.push(schedule);
    await this.save();
    return schedule;
  }

  async updateReviewSchedule(id: string, patch: Partial<ReviewSchedule>): Promise<ReviewSchedule> {
    await this.ensureLoaded();
    const index = this.store.reviewSchedules.findIndex((schedule) => schedule.id === id);
    if (index === -1) notFound("ReviewSchedule", id);
    this.store.reviewSchedules[index] = this.touch({ ...this.store.reviewSchedules[index], ...patch });
    await this.save();
    return this.store.reviewSchedules[index];
  }

  async listRewards(activeOnly = false): Promise<Reward[]> {
    await this.ensureLoaded();
    return this.store.rewards.filter((reward) => !activeOnly || reward.isActive);
  }

  async getReward(id: string): Promise<Reward | null> {
    await this.ensureLoaded();
    return this.store.rewards.find((reward) => reward.id === id) ?? null;
  }

  async listStudentRewards(studentId?: string): Promise<StudentReward[]> {
    await this.ensureLoaded();
    return this.store.studentRewards.filter((reward) => !studentId || reward.studentId === studentId);
  }

  async createStudentReward(reward: StudentReward): Promise<StudentReward> {
    await this.ensureLoaded();
    this.store.studentRewards.push(reward);
    await this.save();
    return reward;
  }

  async listInterventionGroups(classId?: string): Promise<InterventionGroup[]> {
    await this.ensureLoaded();
    return this.store.interventionGroups.filter((group) => !classId || group.classId === classId);
  }

  async getInterventionGroup(id: string): Promise<InterventionGroup | null> {
    await this.ensureLoaded();
    return this.store.interventionGroups.find((group) => group.id === id) ?? null;
  }

  async createInterventionGroup(group: InterventionGroup): Promise<InterventionGroup> {
    await this.ensureLoaded();
    this.store.interventionGroups.push(group);
    await this.save();
    return group;
  }

  async updateInterventionGroup(id: string, patch: Partial<InterventionGroup>): Promise<InterventionGroup> {
    await this.ensureLoaded();
    const index = this.store.interventionGroups.findIndex((group) => group.id === id);
    if (index === -1) notFound("InterventionGroup", id);
    this.store.interventionGroups[index] = this.touch({ ...this.store.interventionGroups[index], ...patch });
    await this.save();
    return this.store.interventionGroups[index];
  }

  async listInterventionGroupMembers(groupId?: string): Promise<InterventionGroupMember[]> {
    await this.ensureLoaded();
    return this.store.interventionGroupMembers.filter((member) => !groupId || member.groupId === groupId);
  }

  async addInterventionGroupMember(member: InterventionGroupMember): Promise<InterventionGroupMember> {
    await this.ensureLoaded();
    this.store.interventionGroupMembers.push(member);
    await this.save();
    return member;
  }

  async removeInterventionGroupMember(id: string): Promise<void> {
    await this.ensureLoaded();
    this.store.interventionGroupMembers = this.store.interventionGroupMembers.filter(
      (member) => member.id !== id,
    );
    await this.save();
  }

  async listTeacherNotes(filters?: { teacherId?: string; studentId?: string }): Promise<TeacherNote[]> {
    await this.ensureLoaded();
    return this.store.teacherNotes.filter((note) => {
      if (filters?.teacherId && note.teacherId !== filters.teacherId) return false;
      if (filters?.studentId && note.studentId !== filters.studentId) return false;
      return true;
    });
  }

  async getTeacherNote(id: string): Promise<TeacherNote | null> {
    await this.ensureLoaded();
    return this.store.teacherNotes.find((note) => note.id === id) ?? null;
  }

  async createTeacherNote(note: TeacherNote): Promise<TeacherNote> {
    await this.ensureLoaded();
    this.store.teacherNotes.push(note);
    await this.save();
    return note;
  }

  async updateTeacherNote(id: string, patch: Partial<TeacherNote>): Promise<TeacherNote> {
    await this.ensureLoaded();
    const index = this.store.teacherNotes.findIndex((note) => note.id === id);
    if (index === -1) notFound("TeacherNote", id);
    this.store.teacherNotes[index] = this.touch({ ...this.store.teacherNotes[index], ...patch });
    await this.save();
    return this.store.teacherNotes[index];
  }

  async deleteTeacherNote(id: string): Promise<void> {
    await this.ensureLoaded();
    this.store.teacherNotes = this.store.teacherNotes.filter((note) => note.id !== id);
    await this.save();
  }

  async listAssignments(filters?: {
    classId?: string;
    unitId?: string;
    status?: Assignment["status"];
  }): Promise<Assignment[]> {
    await this.ensureLoaded();
    return this.store.assignments.filter((assignment) => {
      if (filters?.classId && assignment.classId !== filters.classId) return false;
      if (filters?.unitId && assignment.unitId !== filters.unitId) return false;
      if (filters?.status && assignment.status !== filters.status) return false;
      return true;
    });
  }

  async getAssignment(id: string): Promise<Assignment | null> {
    await this.ensureLoaded();
    return this.store.assignments.find((assignment) => assignment.id === id) ?? null;
  }

  async createAssignment(assignment: Assignment): Promise<Assignment> {
    await this.ensureLoaded();
    this.store.assignments.push(assignment);
    await this.save();
    return assignment;
  }

  async updateAssignment(id: string, patch: Partial<Assignment>): Promise<Assignment> {
    await this.ensureLoaded();
    const index = this.store.assignments.findIndex((assignment) => assignment.id === id);
    if (index === -1) notFound("Assignment", id);
    this.store.assignments[index] = this.touch({ ...this.store.assignments[index], ...patch });
    await this.save();
    return this.store.assignments[index];
  }

  async listAssignmentWords(assignmentId?: string): Promise<AssignmentWord[]> {
    await this.ensureLoaded();
    return this.store.assignmentWords
      .filter((word) => !assignmentId || word.assignmentId === assignmentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async createAssignmentWord(word: AssignmentWord): Promise<AssignmentWord> {
    await this.ensureLoaded();
    this.store.assignmentWords.push(word);
    await this.save();
    return word;
  }
}
