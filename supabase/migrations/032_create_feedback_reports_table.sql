-- Cria a tabela feedback_reports para armazenar feedbacks e relatórios de erros
CREATE TABLE public.feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL, -- 'feedback', 'bug', 'suggestion'
    subject TEXT, -- Assunto breve
    description TEXT NOT NULL,
    status TEXT DEFAULT 'PENDENTE' NOT NULL, -- 'PENDENTE', 'EM_ANALISE', 'RESOLVIDO', 'FECHADO'
    CONSTRAINT check_report_type CHECK (report_type IN ('feedback', 'bug', 'suggestion'))
);

-- Habilita RLS na tabela feedback_reports
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- Policy para permitir que usuários autenticados insiram relatórios
CREATE POLICY "Allow authenticated users to insert feedback reports" ON public.feedback_reports
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy para permitir que usuários com can_view_feedbacks vejam todos os relatórios
CREATE POLICY "Allow users with can_view_feedbacks to view all reports" ON public.feedback_reports
FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_view_feedbacks = TRUE));

-- Policy para permitir que usuários com can_view_feedbacks atualizem o status dos relatórios
CREATE POLICY "Allow users with can_view_feedbacks to update report status" ON public.feedback_reports
FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_view_feedbacks = TRUE))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND can_view_feedbacks = TRUE));
