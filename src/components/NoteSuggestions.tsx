import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";

interface NoteSuggestionsProps {
  noteId: string;
  onConnectionAccept: (targetNoteId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteSuggestions({ noteId, onConnectionAccept, open, onOpenChange }: NoteSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const analyzeSimilarNotes = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar autenticado para usar esta funcionalidade");
      }

    const response = await supabase.functions.invoke("ai-note-analysis", {
      body: {
        noteId,
        analysisType: "similar",
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      console.error("Edge function error:", response.error);
      const errorMsg = response.error.message || "Erro ao analisar conexões.";
      throw new Error(errorMsg);
    }

    const data = response.data;
    
    if (!data || !data.analysis) {
      throw new Error("Resposta inválida do servidor");
    }

      setSuggestions(data.analysis);
      toast({
        title: language === "pt" ? "Análise Concluída" : "Analysis Complete",
        description: language === "pt" 
          ? "A IA encontrou conexões interessantes!" 
          : "AI found interesting connections!",
      });
    } catch (error: any) {
      console.error("Error analyzing notes:", error);
      toast({
        title: language === "pt" ? "Erro na análise" : "Analysis Error",
        description: error.message || (language === "pt" 
          ? "Erro ao processar a análise. Verifique sua conexão e tente novamente." 
          : "Error processing analysis. Check your connection and try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (feedback: "accept" | "reject", suggestionData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("ai_feedback").insert({
      user_id: user.id,
      suggestion_type: "note_connection",
      suggestion_data: suggestionData,
      feedback,
    });

    if (feedback === "accept") {
      onConnectionAccept(suggestionData.targetNoteId);
      toast({
        title: language === "pt" ? "Conexão Criada" : "Connection Created",
        description: language === "pt" 
          ? "A nota foi conectada com sucesso!" 
          : "Note was successfully connected!",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === "pt" ? "Sugestões Inteligentes" : "Smart Suggestions"}
          </DialogTitle>
          <DialogDescription>
            {language === "pt" 
              ? "A IA pode analisar esta nota e sugerir conexões com outras notas relacionadas" 
              : "AI can analyze this note and suggest connections with related notes"}
          </DialogDescription>
        </DialogHeader>
        <CardContent className="space-y-4">
          {!suggestions && (
            <Button 
              onClick={analyzeSimilarNotes} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "pt" ? "Analisando..." : "Analyzing..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {language === "pt" ? "Analisar Conexões" : "Analyze Connections"}
                </>
              )}
            </Button>
          )}

          {suggestions && (
            <div className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="text-sm whitespace-pre-wrap">{suggestions}</div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={analyzeSimilarNotes}
                  disabled={loading}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {language === "pt" ? "Analisar Novamente" : "Analyze Again"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}