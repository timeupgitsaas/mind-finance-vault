import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, MessageSquare, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

interface AIHistoryCardProps {
  onLoadConversation: (conversation: Conversation) => void;
}

export function AIHistoryCard({ onLoadConversation }: AIHistoryCardProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const formatted: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: (conv.messages as any) as Message[],
        created_at: conv.created_at,
      }));

      setConversations(formatted);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConversations(conversations.filter(c => c.id !== id));
      toast({
        title: "Conversa excluída",
        description: "O histórico foi removido.",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Histórico de Conversas com IA
        </CardTitle>
        <CardDescription>
          Suas conversas anteriores estão salvas aqui
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Nenhuma conversa salva ainda.</p>
              <p className="text-xs mt-2">Suas conversas com a IA aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-4 border rounded-lg hover:bg-secondary/50 transition-all cursor-pointer group relative"
                  onClick={() => onLoadConversation(conv)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 pr-8">
                      <p className="font-medium line-clamp-1 mb-1">{conv.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(conv.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        <span>•</span>
                        <span>{conv.messages.length} mensagens</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
