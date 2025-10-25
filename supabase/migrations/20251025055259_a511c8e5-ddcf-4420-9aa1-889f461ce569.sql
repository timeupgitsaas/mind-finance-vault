-- Criar tabela de pastas
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#8B5CF6',
  content_types TEXT[] DEFAULT ARRAY['notes', 'flows', 'mindmaps', 'diary']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de pastas
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pastas
CREATE POLICY "Users can view their own folders"
  ON public.folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON public.folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON public.folders FOR DELETE
  USING (auth.uid() = user_id);

-- Adicionar folder_ids às notas (array de IDs de pastas)
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS folder_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Criar tabela de estatísticas de uso
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  module TEXT NOT NULL, -- 'notes', 'flows', 'mindmap', 'finance', 'diary', 'chat'
  time_spent_minutes INTEGER DEFAULT 0,
  characters_written INTEGER DEFAULT 0,
  words_written INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  connections_created INTEGER DEFAULT 0,
  hour_of_day INTEGER, -- 0-23
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date, module)
);

-- Habilitar RLS na tabela de estatísticas
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para estatísticas
CREATE POLICY "Users can view their own statistics"
  ON public.user_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics"
  ON public.user_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics"
  ON public.user_statistics FOR UPDATE
  USING (auth.uid() = user_id);

-- Criar tabela de entradas de diário
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  mood TEXT, -- 'great', 'good', 'neutral', 'bad', 'terrible'
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  folder_ids UUID[] DEFAULT ARRAY[]::UUID[],
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de diário
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para diário
CREATE POLICY "Users can view their own diary entries"
  ON public.diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries"
  ON public.diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries"
  ON public.diary_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries"
  ON public.diary_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Criar trigger para atualizar updated_at em folders
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON public.folders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar trigger para atualizar updated_at em user_statistics
CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar trigger para atualizar updated_at em diary_entries
CREATE TRIGGER update_diary_entries_updated_at
  BEFORE UPDATE ON public.diary_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_ids ON public.notes USING GIN(folder_ids);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_date ON public.user_statistics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_statistics_module ON public.user_statistics(module);
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON public.diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_folder_ids ON public.diary_entries USING GIN(folder_ids);