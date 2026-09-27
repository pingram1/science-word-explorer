# Science Word Explorer

Science Word Explorer is a structured-literacy science vocabulary application for 5th-grade students. Students work through a ten-step word learning routine that integrates listening, phoneme work, spelling, morphology, pronunciation, picture association, definitions, context use, written production, and science concept application.

Teachers monitor class progress, review skill-level errors, configure supports, and export learning analytics. The app supports a fully functional **local demo mode** without Supabase credentials.

## Local setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed demo data

Demo data is written to `.data/store.json` on first access when `DEMO_MODE=true` (default in `.env.example`).

```bash
cp .env.example .env.local
npm run dev
```

To reset seeded data:

```bash
rm -f .data/store.json
npm run dev
```

Programmatic seeding is also available:

```ts
import { seedDatabase } from "@/lib/seed";
await seedDatabase();
```

## Demo login instructions

When Supabase is not configured, use the **demo role selector** on the home page:

| Route | Description |
| --- | --- |
| `/` | Product overview and demo entry |
| `/demo/student` | Choose a demo student account |
| `/demo/teacher` | Enter as Ms. Rivera (teacher) |
| `/demo/admin` | Enter as Dr. Chen (content manager) |

### Seed users

| Role | Name | Email |
| --- | --- | --- |
| Teacher | Ms. Rivera | `m.rivera@demo.school` |
| Admin | Dr. Chen | `d.chen@demo.school` |
| Student | Sofia Martinez | `sofia.martinez@demo.school` |
| Student | Marcus Johnson | `marcus.johnson@demo.school` |
| Student | Emma Chen | `emma.chen@demo.school` |

Additional demo students are defined in `src/lib/seed/demo-users.ts`. All belong to **Period 3 — Grade 5 Science**.

### Demo words

Six words are fully authored for all ten instructional steps:

- evaporation
- condensation
- hypothesis
- ecosystem
- force
- atom

Start the evaporation lesson from **Water Cycle** unit cards or `/student/learn/evaporation`.

## Supabase setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy credentials into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEMO_MODE=false
```

3. Apply the initial migration:

```bash
supabase db push
# or run supabase/migrations/001_initial_schema.sql in the SQL editor
```

4. Map authenticated users to rows in the `users` table (matching `auth.users.id`).

### Row-level security

Policies in `001_initial_schema.sql` enforce:

- **Students** can read and write only their own learning records.
- **Teachers** can access students enrolled in their classes.
- **Admins** can access all records and manage content.

Helper functions: `is_admin()`, `is_teacher_of_student()`.

## Mastery model

Word mastery is calculated from weighted skill groups (not a single quiz score):

| Skill group | Weight |
| --- | --- |
| Sound and syllable work | 15% |
| Word building and spelling | 20% |
| Morphology | 10% |
| Pronunciation | 10% |
| Picture and definition | 15% |
| Sentence and context | 15% |
| Science concept application | 15% |

A word reaches **Mastered** when:

- Weighted score ≥ 85%
- Essential skills completed (listening, grapheme mapping, definition, concept application)
- At least two separate sessions
- At least one success without heavy hints
- A retrieval attempt completed

Other statuses: `not_started`, `introduced`, `practicing`, `nearly_mastered`, `review_due`, `needs_teacher_support`.

Implementation: `src/lib/learning/mastery.ts`, configuration in `src/lib/constants/mastery.ts`.

## Adaptive rules

Adaptivity is transparent and rule-based (not AI-driven):

| Trigger | Action |
| --- | --- |
| 2 incorrect responses on same skill | Enable slow audio → syllable highlighting → fewer distractors → word bank → increase support level |
| 3 consecutive correct responses without hints | Remove word bank → reduce highlighting → decrease support level |
| Strong definitions, weak spelling | Schedule spelling-focused review |
| Strong spelling, weak application | Schedule concept-focused review |
| Frequent audio replays | Flag for oral-language support |

Teachers see explanations for each recommendation on the dashboard. Implementation: `src/lib/learning/adaptive.ts`.

## Teacher metrics

Structured **learning events** capture every meaningful student action:

- Instructional step and skill category
- Correct/incorrect response and error categories
- Response time, hints, audio replays, support usage
- Device category and completion status

Dashboard metrics include:

- Class mastery averages and review completion
- Students needing support
- Per-student skill profiles and word status
- Word-level difficulty and common errors
- Suggested intervention groups with supporting data

CSV exports are available for class, student, word, and event-level reports via `src/lib/learning/csv-export.ts`.

## Project structure

```
src/
  app/                 # Next.js routes
  components/          # UI and game shell
  lib/
    learning/          # Mastery, adaptive, review, spelling, progress
    repositories/      # Local JSON repository (demo mode)
    seed/              # Demo users, vocabulary, events
    types/             # Domain TypeScript types
e2e/                   # Playwright end-to-end tests
supabase/migrations/   # PostgreSQL schema and RLS
```

## Test commands

```bash
# Unit tests (Vitest)
npm run test

# Unit tests in watch mode
npm run test:watch

# End-to-end tests (Playwright — starts dev server automatically)
npm run test:e2e

# TypeScript check
npm run typecheck

# Lint
npm run lint
```

Unit tests cover mastery calculation, adaptive rules, review scheduling, spelling error classification, permissions, progress aggregation, and CSV export format.

## Known limitations

- **Local demo mode** stores data in `.data/store.json`; it is not suitable for multi-user production deployment.
- **Speech recognition** depends on browser support; a no-microphone fallback is always available.
- **Handwriting canvas** stores stroke data; automated handwriting recognition is not implemented.
- **Placeholder vocabulary** for non-demo words may require teacher review of phoneme and morphology fields (`requiresTeacherReview: true`).
- **Supabase auth integration** requires mapping auth users to application `users` rows.
- **Pronunciation audio** uses text-to-speech fallback when `pronunciationAudioUrl` is null.
- The application does not provide medical, diagnostic, or guaranteed-remediation claims.

## Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `DEMO_MODE` | Use local JSON repository when `true` |
| `SEED_RESET` | Deprecated. Delete `.data/store.json` and restart to re-seed. |

## License

Private — StartRight Tutoring.
