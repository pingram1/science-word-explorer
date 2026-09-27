-- Science Word Explorer — initial schema
-- Matches TypeScript domain types in src/lib/types

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE skill_category AS ENUM (
  'listening',
  'syllable_awareness',
  'phoneme_sequencing',
  'grapheme_mapping',
  'spelling',
  'morphology',
  'pronunciation',
  'picture_association',
  'definition_knowledge',
  'context_use',
  'written_production',
  'concept_application',
  'retrieval_fluency'
);
CREATE TYPE error_category AS ENUM (
  'omission',
  'insertion',
  'substitution',
  'transposition',
  'incorrect_syllable_boundary',
  'incorrect_sound_order',
  'prefix_error',
  'root_or_base_error',
  'suffix_error',
  'definition_misconception',
  'picture_misconception',
  'context_misconception',
  'science_concept_misconception',
  'no_response',
  'timed_out',
  'support_dependent_correct_response'
);
CREATE TYPE support_level AS ENUM ('1', '2', '3', '4');
CREATE TYPE word_mastery_status AS ENUM (
  'not_started',
  'introduced',
  'practicing',
  'nearly_mastered',
  'mastered',
  'review_due',
  'needs_teacher_support'
);
CREATE TYPE instructional_step AS ENUM ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
CREATE TYPE device_category AS ENUM (
  'desktop',
  'tablet',
  'chromebook',
  'interactive_display',
  'unknown'
);
CREATE TYPE input_preference AS ENUM ('typing', 'handwriting', 'both');
CREATE TYPE font_preference AS ENUM ('default', 'opendyslexic', 'high_legibility_sans');
CREATE TYPE class_membership_role AS ENUM ('student', 'teacher');
CREATE TYPE learning_session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE completion_status AS ENUM ('completed', 'skipped', 'in_progress', 'abandoned');
CREATE TYPE review_interval_key AS ENUM (
  'same_session',
  'one_day',
  'three_days',
  'seven_days',
  'fourteen_days'
);
CREATE TYPE intervention_group_status AS ENUM ('suggested', 'active', 'dismissed');
CREATE TYPE assignment_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE reward_category AS ENUM (
  'lab_badge',
  'garden_item',
  'space_mission',
  'wilderness_trail',
  'milestone'
);
CREATE TYPE morpheme_type AS ENUM ('prefix', 'root', 'base', 'suffix');
CREATE TYPE text_size AS ENUM ('small', 'medium', 'large', 'extra_large');
CREATE TYPE letter_spacing AS ENUM ('normal', 'wide', 'extra_wide');
CREATE TYPE line_spacing AS ENUM ('normal', 'relaxed', 'loose');

-- ---------------------------------------------------------------------------
-- Core identity
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  school_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  grade_level INTEGER NOT NULL DEFAULT 5,
  default_support_level support_level NOT NULL DEFAULT '2',
  support_profile_id UUID,
  journey_progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  grade_level INTEGER NOT NULL DEFAULT 5,
  default_support_level support_level NOT NULL DEFAULT '2',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE class_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role class_membership_role NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  grade_level INTEGER NOT NULL DEFAULT 5,
  standards_tags TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  grade_level INTEGER NOT NULL DEFAULT 5,
  standards_tags TEXT[] NOT NULL DEFAULT '{}',
  student_friendly_definition TEXT NOT NULL,
  formal_definition TEXT NOT NULL,
  pronunciation_audio_url TEXT,
  syllable_breakdown TEXT[] NOT NULL DEFAULT '{}',
  phoneme_sequence TEXT[] NOT NULL DEFAULT '{}',
  grapheme_sequence TEXT[] NOT NULL DEFAULT '{}',
  prefix TEXT,
  base_or_root TEXT,
  suffix TEXT,
  morpheme_meanings JSONB NOT NULL DEFAULT '[]',
  morphology_applicable BOOLEAN NOT NULL DEFAULT FALSE,
  requires_teacher_review BOOLEAN NOT NULL DEFAULT FALSE,
  image_distractor_ids TEXT[] NOT NULL DEFAULT '{}',
  definition_distractors TEXT[] NOT NULL DEFAULT '{}',
  example_sentence TEXT NOT NULL DEFAULT '',
  cloze_sentence TEXT NOT NULL DEFAULT '',
  common_spelling_errors TEXT[] NOT NULL DEFAULT '{}',
  common_misconceptions TEXT[] NOT NULL DEFAULT '{}',
  glossary_translations JSONB NOT NULL DEFAULT '[]',
  difficulty_level support_level NOT NULL DEFAULT '2',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vocabulary_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE application_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  choices TEXT[] NOT NULL DEFAULT '{}',
  correct_choice_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT NOT NULL DEFAULT '',
  difficulty_level support_level NOT NULL DEFAULT '2',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Assignments and support
-- ---------------------------------------------------------------------------

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  default_support_level support_level NOT NULL DEFAULT '2',
  due_date TIMESTAMPTZ,
  status assignment_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assignment_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  support_level_override support_level,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, vocabulary_word_id)
);

CREATE TABLE student_support_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  font_preference font_preference NOT NULL DEFAULT 'default',
  text_size text_size NOT NULL DEFAULT 'medium',
  letter_spacing letter_spacing NOT NULL DEFAULT 'normal',
  line_spacing line_spacing NOT NULL DEFAULT 'normal',
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  audio_directions BOOLEAN NOT NULL DEFAULT TRUE,
  text_to_speech BOOLEAN NOT NULL DEFAULT FALSE,
  slow_playback BOOLEAN NOT NULL DEFAULT FALSE,
  syllable_highlighting BOOLEAN NOT NULL DEFAULT FALSE,
  morpheme_highlighting BOOLEAN NOT NULL DEFAULT FALSE,
  number_of_distractors INTEGER NOT NULL DEFAULT 3 CHECK (number_of_distractors IN (2, 3, 4)),
  word_bank BOOLEAN NOT NULL DEFAULT FALSE,
  picture_support BOOLEAN NOT NULL DEFAULT FALSE,
  extended_time BOOLEAN NOT NULL DEFAULT FALSE,
  bilingual_glossary BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_glossary_language TEXT,
  speech_recognition_alternative BOOLEAN NOT NULL DEFAULT TRUE,
  input_preference input_preference NOT NULL DEFAULT 'typing',
  student_adjustable_display BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE student_profiles
  ADD CONSTRAINT student_profiles_support_profile_fkey
  FOREIGN KEY (support_profile_id) REFERENCES student_support_profiles(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Learning activity
-- ---------------------------------------------------------------------------

CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE RESTRICT,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  support_level support_level NOT NULL DEFAULT '2',
  current_step instructional_step NOT NULL DEFAULT '1',
  status learning_session_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  device_category device_category NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE RESTRICT,
  instructional_step instructional_step NOT NULL,
  skill_category skill_category NOT NULL,
  support_level support_level NOT NULL,
  is_correct BOOLEAN NOT NULL,
  student_response TEXT,
  correct_response TEXT,
  error_categories error_category[] NOT NULL DEFAULT '{}',
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  hints_used INTEGER NOT NULL DEFAULT 0,
  audio_replays INTEGER NOT NULL DEFAULT 0,
  slow_audio_used BOOLEAN NOT NULL DEFAULT FALSE,
  text_to_speech_used BOOLEAN NOT NULL DEFAULT FALSE,
  word_bank_used BOOLEAN NOT NULL DEFAULT FALSE,
  picture_support_used BOOLEAN NOT NULL DEFAULT FALSE,
  speech_recognition_confidence NUMERIC(5, 4),
  teacher_verified BOOLEAN NOT NULL DEFAULT FALSE,
  support_dependent_correct BOOLEAN NOT NULL DEFAULT FALSE,
  completion_status completion_status NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE RESTRICT,
  session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  attempt_id UUID REFERENCES learning_attempts(id) ON DELETE SET NULL,
  instructional_step instructional_step NOT NULL,
  skill_category skill_category NOT NULL,
  support_level support_level NOT NULL,
  prompt_shown TEXT,
  student_response TEXT,
  correct_response TEXT,
  is_correct BOOLEAN NOT NULL,
  error_categories error_category[] NOT NULL DEFAULT '{}',
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  hints_used INTEGER NOT NULL DEFAULT 0,
  audio_replays INTEGER NOT NULL DEFAULT 0,
  slow_audio_used BOOLEAN NOT NULL DEFAULT FALSE,
  text_to_speech_used BOOLEAN NOT NULL DEFAULT FALSE,
  word_bank_used BOOLEAN NOT NULL DEFAULT FALSE,
  picture_support_used BOOLEAN NOT NULL DEFAULT FALSE,
  speech_recognition_confidence NUMERIC(5, 4),
  teacher_verified BOOLEAN NOT NULL DEFAULT FALSE,
  support_dependent_correct BOOLEAN NOT NULL DEFAULT FALSE,
  completion_status completion_status NOT NULL DEFAULT 'completed',
  device_category device_category NOT NULL DEFAULT 'unknown',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_word_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  weighted_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  status word_mastery_status NOT NULL DEFAULT 'not_started',
  session_count INTEGER NOT NULL DEFAULT 0,
  successful_without_high_hint BOOLEAN NOT NULL DEFAULT FALSE,
  retrieval_attempt_completed BOOLEAN NOT NULL DEFAULT FALSE,
  essential_skills_completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_session_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, vocabulary_word_id)
);

CREATE TABLE student_skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  skill_category skill_category NOT NULL,
  score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, vocabulary_word_id, skill_category)
);

CREATE TABLE review_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  interval_key review_interval_key NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  session_id UUID REFERENCES learning_sessions(id) ON DELETE SET NULL,
  is_due BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Rewards and intervention
-- ---------------------------------------------------------------------------

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category reward_category NOT NULL,
  image_url TEXT,
  points_required INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id UUID REFERENCES learning_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, reward_id, earned_at)
);

CREATE TABLE intervention_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reason TEXT NOT NULL,
  supporting_data TEXT NOT NULL DEFAULT '',
  recommended_activity TEXT NOT NULL DEFAULT '',
  status intervention_group_status NOT NULL DEFAULT 'suggested',
  is_manual BOOLEAN NOT NULL DEFAULT FALSE,
  skill_focus skill_category,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intervention_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES intervention_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, student_id)
);

CREATE TABLE teacher_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_class_memberships_class ON class_memberships(class_id);
CREATE INDEX idx_class_memberships_user ON class_memberships(user_id);
CREATE INDEX idx_vocabulary_words_unit ON vocabulary_words(unit_id);
CREATE INDEX idx_vocabulary_words_word ON vocabulary_words(word);
CREATE INDEX idx_learning_sessions_student ON learning_sessions(student_id);
CREATE INDEX idx_learning_sessions_status ON learning_sessions(status);
CREATE INDEX idx_learning_attempts_session ON learning_attempts(session_id);
CREATE INDEX idx_learning_attempts_student ON learning_attempts(student_id);
CREATE INDEX idx_learning_events_student ON learning_events(student_id);
CREATE INDEX idx_learning_events_timestamp ON learning_events(timestamp);
CREATE INDEX idx_learning_events_word ON learning_events(vocabulary_word_id);
CREATE INDEX idx_student_word_mastery_student ON student_word_mastery(student_id);
CREATE INDEX idx_student_word_mastery_status ON student_word_mastery(status);
CREATE INDEX idx_review_schedule_student ON review_schedule(student_id);
CREATE INDEX idx_review_schedule_due ON review_schedule(scheduled_for) WHERE completed_at IS NULL;
CREATE INDEX idx_assignments_class ON assignments(class_id);

-- ---------------------------------------------------------------------------
-- Updated-at trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_profiles_updated_at BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER class_memberships_updated_at BEFORE UPDATE ON class_memberships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER vocabulary_words_updated_at BEFORE UPDATE ON vocabulary_words
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER vocabulary_images_updated_at BEFORE UPDATE ON vocabulary_images
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER application_questions_updated_at BEFORE UPDATE ON application_questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER assignments_updated_at BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_support_profiles_updated_at BEFORE UPDATE ON student_support_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER learning_sessions_updated_at BEFORE UPDATE ON learning_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_word_mastery_updated_at BEFORE UPDATE ON student_word_mastery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER student_skill_mastery_updated_at BEFORE UPDATE ON student_skill_mastery
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER review_schedule_updated_at BEFORE UPDATE ON review_schedule
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER rewards_updated_at BEFORE UPDATE ON rewards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER intervention_groups_updated_at BEFORE UPDATE ON intervention_groups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER teacher_notes_updated_at BEFORE UPDATE ON teacher_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_support_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_word_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;

-- Helper: current authenticated user id from JWT (Supabase auth.uid())
-- Policies assume users.id matches auth.users.id or a mapped profile id.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_teacher_of_student(target_student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM class_memberships teacher_m
    JOIN class_memberships student_m
      ON teacher_m.class_id = student_m.class_id
    WHERE teacher_m.user_id = auth.uid()
      AND teacher_m.role = 'teacher'
      AND student_m.user_id = target_student_id
      AND student_m.role = 'student'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Users: self read; teachers read students in class; admins read all
CREATE POLICY users_select_self ON users
  FOR SELECT USING (id = auth.uid() OR is_admin() OR is_teacher_of_student(id));

CREATE POLICY users_update_self ON users
  FOR UPDATE USING (id = auth.uid() OR is_admin());

-- Student-owned learning records
CREATE POLICY student_learning_sessions ON learning_sessions
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_learning_attempts ON learning_attempts
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_learning_events ON learning_events
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_word_mastery_policy ON student_word_mastery
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_skill_mastery_policy ON student_skill_mastery
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_review_schedule ON review_schedule
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_rewards_policy ON student_rewards
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_support_profiles_policy ON student_support_profiles
  FOR ALL USING (student_id = auth.uid() OR is_teacher_of_student(student_id) OR is_admin());

CREATE POLICY student_profiles_policy ON student_profiles
  FOR ALL USING (user_id = auth.uid() OR is_teacher_of_student(user_id) OR is_admin());

-- Teacher class management
CREATE POLICY classes_teacher_policy ON classes
  FOR ALL USING (teacher_id = auth.uid() OR is_admin());

CREATE POLICY class_memberships_policy ON class_memberships
  FOR ALL USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_memberships.class_id AND c.teacher_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY assignments_teacher_policy ON assignments
  FOR ALL USING (
    teacher_id = auth.uid()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM class_memberships cm
      WHERE cm.class_id = assignments.class_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY assignment_words_read ON assignment_words
  FOR SELECT USING (TRUE);

CREATE POLICY teacher_notes_policy ON teacher_notes
  FOR ALL USING (teacher_id = auth.uid() OR is_admin() OR student_id = auth.uid());

CREATE POLICY intervention_groups_policy ON intervention_groups
  FOR ALL USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = intervention_groups.class_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY intervention_group_members_policy ON intervention_group_members
  FOR ALL USING (
    is_admin()
    OR is_teacher_of_student(student_id)
  );

-- Content readable by authenticated users; writable by admins
CREATE POLICY units_read ON units FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY units_admin_write ON units FOR ALL USING (is_admin());

CREATE POLICY vocabulary_words_read ON vocabulary_words FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY vocabulary_words_admin_write ON vocabulary_words FOR ALL USING (is_admin());

CREATE POLICY vocabulary_images_read ON vocabulary_images FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY vocabulary_images_admin_write ON vocabulary_images FOR ALL USING (is_admin());

CREATE POLICY application_questions_read ON application_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY application_questions_admin_write ON application_questions FOR ALL USING (is_admin());

CREATE POLICY rewards_read ON rewards FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY rewards_admin_write ON rewards FOR ALL USING (is_admin());

CREATE POLICY teacher_profiles_read ON teacher_profiles
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY teacher_profiles_write ON teacher_profiles
  FOR ALL USING (user_id = auth.uid() OR is_admin());
