-- =============================================================================
-- BIG PROMPTER — DATABASE SCHEMA INITIAL MIGRATION
-- Migration Version: 20261124000000_initial_schema.sql
-- Specification: Master Product Blueprint v1.0 (Part 7)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_mode TEXT NOT NULL DEFAULT 'professional' CHECK (user_mode IN ('beginner', 'professional', 'expert')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROJECTS (Isolated workspace scope)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- 3. PROMPT_SESSIONS
CREATE TABLE IF NOT EXISTS public.prompt_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  raw_input TEXT NOT NULL,
  domain TEXT NOT NULL,
  engineering_level TEXT NOT NULL CHECK (engineering_level IN ('L1', 'L2', 'L3', 'L4')),
  target_model TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('input', 'discovery', 'compiled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prompt_sessions_project_id ON public.prompt_sessions(project_id);

-- 4. REQUIREMENTS
CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.prompt_sessions(id) ON DELETE CASCADE,
  requirement_key TEXT NOT NULL,
  requirement_value TEXT NOT NULL,
  is_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_requirements_session_id ON public.requirements(session_id);

-- 5. DISCOVERY_QUESTIONS
CREATE TABLE IF NOT EXISTS public.discovery_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.prompt_sessions(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('role', 'format', 'constraints', 'edge_cases', 'model_fit', 'context')),
  question TEXT NOT NULL,
  rationale TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_discovery_questions_session_id ON public.discovery_questions(session_id);

-- 6. DISCOVERY_ANSWERS
CREATE TABLE IF NOT EXISTS public.discovery_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.discovery_questions(id) ON DELETE CASCADE,
  selected_option_id TEXT,
  custom_answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_discovery_answers_question_id ON public.discovery_answers(question_id);

-- 7. PROMPT_ARCHITECTURES
CREATE TABLE IF NOT EXISTS public.prompt_architectures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.prompt_sessions(id) ON DELETE CASCADE,
  architecture_spec JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PROMPT_VERSIONS
CREATE TABLE IF NOT EXISTS public.prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.prompt_sessions(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('L1', 'L2', 'L3', 'L4')),
  target_model TEXT NOT NULL,
  compiled_prompt TEXT NOT NULL,
  components JSONB NOT NULL,
  metrics JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prompt_versions_session_id ON public.prompt_versions(session_id);

-- 9. PROMPT_TESTS
CREATE TABLE IF NOT EXISTS public.prompt_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES public.prompt_versions(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  test_input TEXT NOT NULL,
  test_output TEXT NOT NULL,
  latency_ms INT NOT NULL,
  tokens_used INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_prompt_tests_version_id ON public.prompt_tests(version_id);

-- 10. EVALUATION_RESULTS
CREATE TABLE IF NOT EXISTS public.evaluation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES public.prompt_tests(id) ON DELETE CASCADE,
  intent_fidelity_score NUMERIC(5,2),
  structural_depth_score NUMERIC(5,2),
  security_resistance_score NUMERIC(5,2),
  model_compatibility_score NUMERIC(5,2),
  overall_score NUMERIC(5,2),
  audit_notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PROVIDER_CONFIGS (BYOK credentials, encrypted)
CREATE TABLE IF NOT EXISTS public.provider_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'anthropic', 'openai')),
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- 12. USAGE_EVENTS
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.prompt_sessions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  total_tokens INT NOT NULL,
  estimated_cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_usage_events_user_id ON public.usage_events(user_id);

-- 13. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'professional', 'expert')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  raw_idea TEXT NOT NULL,
  recommended_level TEXT NOT NULL CHECK (recommended_level IN ('L1', 'L2', 'L3', 'L4')),
  recommended_model TEXT NOT NULL,
  is_system_template BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. TEMPLATE_VERSIONS
CREATE TABLE IF NOT EXISTS public.template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id TEXT NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  spec JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. SHARED_ASSETS
CREATE TABLE IF NOT EXISTS public.shared_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES public.prompt_versions(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  payload JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. SUPPORT_TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. INCIDENTS
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  impact TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_architectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read and update their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Isolated by user_id
CREATE POLICY "Users view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Prompt Sessions: Access inherited via projects.user_id
CREATE POLICY "Users view own sessions" ON public.prompt_sessions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = prompt_sessions.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users insert own sessions" ON public.prompt_sessions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = prompt_sessions.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users update own sessions" ON public.prompt_sessions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = prompt_sessions.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users delete own sessions" ON public.prompt_sessions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = prompt_sessions.project_id AND projects.user_id = auth.uid()));

-- Provider Configs: Strictly isolated
CREATE POLICY "Users view own provider configs" ON public.provider_configs FOR ALL USING (auth.uid() = user_id);

-- System templates: Public read
CREATE POLICY "Anyone view system templates" ON public.templates FOR SELECT USING (is_system_template = TRUE);
