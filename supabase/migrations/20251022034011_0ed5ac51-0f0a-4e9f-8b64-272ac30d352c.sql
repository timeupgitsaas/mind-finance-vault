-- Adicionar campos para conexões manuais e feedback de IA
ALTER TABLE notes ADD COLUMN IF NOT EXISTS manual_connections uuid[] DEFAULT ARRAY[]::uuid[];
ALTER TABLE notes ADD COLUMN IF NOT EXISTS ai_suggested_connections uuid[] DEFAULT ARRAY[]::uuid[];

-- Criar tabela para feedback de IA
CREATE TABLE IF NOT EXISTS ai_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  suggestion_type text NOT NULL,
  suggestion_data jsonb NOT NULL,
  feedback text NOT NULL CHECK (feedback IN ('accept', 'reject', 'ignore')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_feedback
CREATE POLICY "Users can view their own feedback"
  ON ai_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback"
  ON ai_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar tabela para exportações
CREATE TABLE IF NOT EXISTS exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  export_type text NOT NULL,
  export_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para exports
CREATE POLICY "Users can view their own exports"
  ON exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports"
  ON exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);