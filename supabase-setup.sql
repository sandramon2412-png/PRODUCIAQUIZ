-- ============================================
-- PRODUCIA INTELLIGENCE - Supabase Setup
-- Ejecuta este SQL en: Supabase Dashboard → SQL Editor
-- ============================================

-- Tabla de Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT DEFAULT 'dark',
  questions JSONB NOT NULL DEFAULT '[]',
  results JSONB NOT NULL DEFAULT '[]',
  lead_config JSONB,
  redirect_config JSONB,
  pixel_config JSONB,
  author_uid UUID REFERENCES auth.users(id),
  author_email TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id TEXT REFERENCES quizzes(id) ON DELETE CASCADE,
  author_uid UUID REFERENCES auth.users(id),
  name TEXT,
  email TEXT,
  score INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Planes de Usuario
CREATE TABLE IF NOT EXISTS user_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'agency')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_quizzes_author ON quizzes(author_uid);
CREATE INDEX IF NOT EXISTS idx_leads_author ON leads(author_uid);
CREATE INDEX IF NOT EXISTS idx_leads_quiz ON leads(quiz_id);

-- Row Level Security (RLS) - Seguridad por fila
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de Quizzes
-- Cualquiera puede leer quizzes publicados (para el quiz público)
CREATE POLICY "Public quizzes are viewable by everyone"
  ON quizzes FOR SELECT
  USING (true);

-- Solo el autor puede insertar/actualizar/eliminar sus quizzes
CREATE POLICY "Users can insert their own quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = author_uid);

CREATE POLICY "Users can update their own quizzes"
  ON quizzes FOR UPDATE
  USING (auth.uid() = author_uid);

CREATE POLICY "Users can delete their own quizzes"
  ON quizzes FOR DELETE
  USING (auth.uid() = author_uid);

-- Políticas de Leads
-- Cualquiera puede insertar leads (visitantes del quiz)
CREATE POLICY "Anyone can submit leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Solo el autor del quiz puede ver los leads
CREATE POLICY "Authors can view their leads"
  ON leads FOR SELECT
  USING (auth.uid() = author_uid);

-- Políticas de User Plans
CREATE POLICY "Users can view their own plan"
  ON user_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan"
  ON user_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own plan"
  ON user_plans FOR UPDATE
  USING (auth.uid() = user_id);
