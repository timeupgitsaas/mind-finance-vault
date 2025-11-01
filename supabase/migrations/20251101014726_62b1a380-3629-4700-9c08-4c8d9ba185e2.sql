-- Adicionar políticas RLS faltantes para segurança completa

-- Política DELETE para user_statistics
CREATE POLICY "Users can delete their own statistics"
ON public.user_statistics
FOR DELETE
USING (auth.uid() = user_id);

-- Políticas UPDATE e DELETE para ai_feedback
CREATE POLICY "Users can update their own feedback"
ON public.ai_feedback
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
ON public.ai_feedback
FOR DELETE
USING (auth.uid() = user_id);

-- Política UPDATE para exports
CREATE POLICY "Users can update their own exports"
ON public.exports
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política DELETE para user_preferences
CREATE POLICY "Users can delete their own preferences"
ON public.user_preferences
FOR DELETE
USING (auth.uid() = user_id);