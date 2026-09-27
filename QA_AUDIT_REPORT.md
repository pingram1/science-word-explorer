# QA Audit Report — Scientific Word Explorer

**Date:** 15 August 2026  
**Scope:** Full-stack audit of routing, session auth, grading, RBAC, vocabulary lifecycle, and local JSON persistence.  
**Personas:** Teacher (administrator / content creator) and Student (player).  
**Harness:** Vitest (85 tests) + Playwright Chromium (Teacher RBAC, Student scoring, Teacher dashboard, Evaporation lesson).

iCloud dataless files were scanned first. No `.icloud` placeholders were found under `src/`. `next-env.d.ts` was restored after being dataless. `node_modules` had thousands of dataless files and was reinstalled so tests could run.

---

## Executive summary

The live HTTP path was trusting the client for correctness, allowing step skips, exposing teacher APIs without server auth, hard-deleting vocabulary under in-progress sessions, and wiping `.data/store.json` whenever a new Next.js worker initialized with `SEED_RESET=true`. Those issues are fixed. Remaining risks are demo-mode secrets, a dead auto-advance helper that must not be rewired, and last-write-wins JSON persistence (not production-safe).

| ID | Severity | Persona | Status |
| --- | --- | --- | --- |
| QA-01 | Critical | Student | Fixed |
| QA-02 | Critical | Student | Fixed |
| QA-03 | High | Teacher | Fixed |
| QA-04 | High | Teacher | Fixed |
| QA-05 | High | Teacher | Fixed |
| QA-06 | High | Student | Fixed |
| QA-07 | High | Student | Fixed |
| QA-08 | Medium | Teacher | Fixed |
| QA-09 | Medium | Student | Fixed |
| QA-10 | Medium | Student | Fixed |
| QA-11 | Low | Teacher | Open (documented) |
| QA-12 | Low | Both | Open (demo limitation) |

---

## Findings

### QA-01 — Client-claimed `isCorrect` was accepted as the grade

- **Persona:** Student  
- **Location:** `src/lib/services/learning-service.ts` (attempt ingest; now lines 336–354), previously `POST /api/sessions/[id]/attempts`  
- **Why it failed:** The API stored `body.isCorrect`, `errorCategories`, and `correctResponse` from the browser. A student could `POST` `{ instructionalStep: 1, studentResponse: "1", isCorrect: true }` and receive mastery credit without producing the canonical answer.  
- **Fix:** `gradeInstructionalStep()` in `src/lib/learning/grade-attempt.ts` grades against the `VocabularyWord` record. Client `isCorrect` is ignored. `useStepAttempt.ts` advances only when the **server** grade is correct.  
- **Test:** `e2e/student-scoring.spec.ts`, `src/lib/learning/__tests__/grade-attempt.test.ts`

### QA-02 — `completeStep` accepted any step, including 10

- **Persona:** Student  
- **Location:** `src/lib/services/learning-service.ts` lines 246–287; `src/app/api/sessions/[id]/route.ts`  
- **Why it failed:** `PATCH` `{ action: "completeStep", step: 10 }` advanced the session without a passing attempt on the current step. Players could finish the routine without playing.  
- **Fix:** `completeStep` only completes `session.currentStep`, requires `hasPassedStep()`, and returns 409 (`StepProgressError`) on skip. Attempts for a different step are rejected by `assertSessionAcceptsAttempts()`.  
- **Test:** `e2e/student-scoring.spec.ts` expects 409 for `step: 10` and for an attempt on step 10 while still on step 1.

### QA-03 — Teacher/admin layouts were client-only (no server auth)

- **Persona:** Teacher  
- **Location:** `src/app/teacher/layout.tsx` (now a server layout calling `requireTeacherOrAdminSession()` at line 9); `src/app/admin/layout.tsx`  
- **Why it failed:** Routes under `/teacher` and `/admin` did not enforce a server session. Knowing a URL was enough to load shells. Combined with unsigned cookies (QA-06) this was a full RBAC bypass.  
- **Fix:** Server layouts redirect unauthenticated users. UI moved to `TeacherShell.tsx` / `AdminShell.tsx`.

### QA-04 — Intervention API had no auth; dashboard leaked other classes

- **Persona:** Teacher  
- **Location:** `src/app/api/teacher/intervention/route.ts` (GET now `requireTeacherAccess()` at line 17); `src/lib/teacher/services.ts`; `src/lib/learning/permissions.ts`  
- **Why it failed:** `GET /api/teacher/intervention` was public. Dashboard/session list endpoints could return students and sessions outside the teacher’s class.  
- **Fix:** `requireTeacherClassAccess()`, `canTeacherAccessClass()`, and scoped `GET /api/sessions` (own students only; admin sees all).  
- **Test:** `e2e/teacher-rbac.spec.ts` — student gets 403 on intervention and admin vocabulary; teacher gets 403 on `classId=class-not-owned`.

### QA-05 — Hard-delete of vocabulary orphaned in-progress games

- **Persona:** Teacher (while a student is playing)  
- **Location:** `src/lib/services/content-service.ts` lines 111–126  
- **Why it failed:** Deleting a word removed the canonical record. A student mid-session then hit “word not found” / broken grading. Historical attempts pointed at a missing id.  
- **Fix:** Soft-delete sets `isActive: false`. `startSession` refuses inactive words (409). Existing sessions keep the word row for grading.

### QA-06 — Unsigned JSON session cookie (privilege escalation)

- **Persona:** Teacher / Student  
- **Location:** `src/lib/auth/session.ts` lines 29–118  
- **Why it failed:** `swe_session` was raw JSON `{ userId, role }`. Anyone who could set the cookie (curl, DevTools) could become `adminChen`.  
- **Fix:** HMAC-SHA256 signed payload (`serializeSessionCookie` / `parseSessionCookie`). Unsigned JSON is rejected.  
- **Test:** `src/lib/auth/__tests__/session.test.ts`; `e2e/teacher-rbac.spec.ts` unsigned admin cookie cannot call `/api/admin/vocabulary`.

### QA-07 — `SEED_RESET=true` wiped in-progress sessions

- **Persona:** Student  
- **Location:** `src/lib/seed/index.ts` lines 90–98; Playwright `webServer` previously injected `SEED_RESET=true`  
- **Why it failed:** `getRepository()` calls `seedDatabase()` on first init **per process**. With `SEED_RESET=true`, every new Next.js worker deleted `.data/store.json`. `POST /api/sessions` then `GET` the session page returned **404 Session not found** (evaporation e2e). Teacher dashboards showed no new attempts.  
- **Fix:** Seeding is idempotent if the store file exists. Playwright wipes the file **once** before `npm run dev`. README reset is `rm -f .data/store.json`.

### QA-08 — Stale in-memory store across Next.js workers

- **Persona:** Student  
- **Location:** `src/lib/repositories/local-store.ts` lines 34–68; `src/lib/repositories/local-repository.ts` `ensureLoaded()` at line 60  
- **Why it failed:** `LocalRepository` loaded disk once. Worker B never saw sessions created by worker A → 404 after Start Lesson.  
- **Fix:** Reload when file `mtime` changes. `ensureLoaded()` always reconciles from disk.

### QA-09 — Rapid duplicate attempts could race

- **Persona:** Student  
- **Location:** `src/lib/services/learning-service.ts` lines 64–72 and 304–312; `src/lib/utils/mutex.ts`  
- **Why it failed:** Overlapping `POST /attempts` could interleave mastery updates and produce inconsistent scores.  
- **Fix:** Per-session `Mutex` serializes `recordAttemptAndEvent` and `completeStep`. Store writes use unique temp files plus a mutex.

### QA-10 — Empty submit auto-filled the correct answer

- **Persona:** Student  
- **Location:** Step components under `src/components/student/steps/` (e.g. Step 5 previously submitted `word.word` when the transcript was empty)  
- **Why it failed:** Convenience for e2e became a cheat: Check answer with no input was scored correct.  
- **Fix:** `submitDisabled` until there is a real response. Empty responses grade as `no_response`. Step 10 radios require a selection (`Step10ApplyWord.tsx`).

### QA-11 — Unused `recordAttempt` still auto-advances the session

- **Persona:** Future regression (Student)  
- **Location:** `src/lib/api/student-services.ts` `recordAttempt()` (~line 349)  
- **Why it fails if rewired:** It grades server-side but then increments `currentStep` on any correct answer **without** the mutex or `completeStep` pass check. HTTP routes use `recordAttemptAndEvent` instead.  
- **Status:** Not on the live path. Comment added so it is not wired to an API.

### QA-12 — Demo `SESSION_SECRET` default and JSON store

- **Persona:** Both  
- **Location:** `src/lib/auth/session.ts` `sessionSecret()` (line 29); `.data/store.json`  
- **Why it remains:** The HMAC default secret is in source, so a determined attacker who reads the repo can still forge cookies. The local JSON store is last-write-wins across processes and is not a multi-tenant database.  
- **Mitigation:** Set `SESSION_SECRET` in production; do not deploy this demo store as the system of record. Supabase repository is still a stub when env vars are present (`src/lib/repositories/index.ts`).

---

## Tests added or updated

| File | Persona / purpose |
| --- | --- |
| `src/lib/learning/__tests__/grade-attempt.test.ts` | Server grading, skip lock, empty response |
| `src/lib/learning/__tests__/permissions.test.ts` | Class / student access |
| `src/lib/auth/__tests__/session.test.ts` | Signed cookies; reject forged JSON |
| `e2e/teacher-rbac.spec.ts` | Student cannot hit teacher/admin APIs; class isolation; cookie forge |
| `e2e/student-scoring.spec.ts` | Spoofed `isCorrect` is false; skip step 10 → 409 |
| `e2e/teacher-dashboard.spec.ts` | Teacher sees `evaporation` on the student after gameplay |
| `e2e/evaporation-lesson.spec.ts` | Full 10-step routine |
| `e2e/helpers.ts` | Real answers (no auto-fill); application choice via `application-choice-0` |

**Latest run:** Vitest 10 files / 85 passed. Playwright: teacher-rbac (3), student-scoring (1), teacher-dashboard (1), evaporation-lesson (1) passed on a fresh `CI=true` server.

---

## Remediation map

| Area | Primary files |
| --- | --- |
| Grading | `src/lib/learning/grade-attempt.ts`, `src/lib/services/learning-service.ts`, `src/components/student/hooks/useStepAttempt.ts` |
| RBAC | `src/lib/auth/session.ts`, `src/lib/auth/api-helpers.ts`, `src/lib/learning/permissions.ts`, teacher/admin layouts |
| Vocab lifecycle | `src/lib/services/content-service.ts` |
| Persistence | `src/lib/seed/index.ts`, `src/lib/repositories/local-store.ts`, `playwright.config.ts` |
| Teacher UX | `src/lib/teacher/services.ts` (session `word` label), `src/app/teacher/students/[id]/page.tsx` |
