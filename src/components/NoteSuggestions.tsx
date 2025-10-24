import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Link2, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NoteSuggestionsProps {
  noteId: string;
  onConnectionAccept: (targetNoteId: string) => void;
}

export function NoteSuggestions({ noteId, onConnectionAccept }: NoteSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const { toast } = useToast();

  const analyzeSimilarNotes = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Você precisa estar autenticado para usar esta funcionalidade");
      }

      const { data, error } = await supabase.functions.invoke("ai-note-analysis", {
        body: {
          noteId,
          analysisType: "similar",
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro ao analisar conexões. Tente novamente.");
      }

      if (!data || !data.analysis) {
        throw new Error("Resposta inválida do servidor");
      }

      setSuggestions(data.analysis);
      toast({
        title: "Análise Concluída",
        description: "A IA encontrou conexões interessantes!",
      });
    } catch (error: any) {
      console.error("Error analyzing notes:", error);
      toast({
        title: "Erro na análise",
        description: error.message || "Erro ao processar a análise. Verifique sua conexão e tente novamente.",
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
        title: "Conexão Criada",
        description: "A nota foi conectada com sucesso!",
      });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Sugestões Inteligentes
        </CardTitle>
        <CardDescription>
          A IA pode analisar esta nota e sugerir conexões com outras notas relacionadas
        </CardDescription>
      </CardHeader>
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
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analisar Conexões
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
                Analisar Novamente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}