import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, Loader2, History, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function AIChat() {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const stored = localStorage.getItem("ai_conversations");
    if (stored) {
      setConversations(JSON.parse(stored));
    }
  };

  const saveConversation = () => {
    if (currentMessages.length === 0) return;

    const conversation: Conversation = {
      id: currentConversationId || crypto.randomUUID(),
      title: currentMessages[0]?.content.substring(0, 50) || "Nova conversa",
      messages: currentMessages,
      created_at: new Date().toISOString(),
    };

    const updated = conversations.filter(c => c.id !== conversation.id);
    updated.unshift(conversation);
    setConversations(updated);
    localStorage.setItem("ai_conversations", JSON.stringify(updated));
    setCurrentConversationId(conversation.id);
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
  };

  const newConversation = () => {
    setCurrentMessages([]);
    setCurrentConversationId(null);
  };

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem("ai_conversations", JSON.stringify(updated));
    if (currentConversationId === id) {
      newConversation();
    }
    toast({
      title: "Conversa excluída",
      description: "O histórico foi removido.",
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setCurrentMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: input,
          conversationHistory: currentMessages,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      setCurrentMessages(prev => {
        const updated = [...prev, assistantMessage];
        return updated;
      });

      // Auto-save after each message
      setTimeout(saveConversation, 500);
    } catch (error: any) {
      toast({
        title: "Erro ao conversar com IA",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Chat com IA
          </div>
          <Button variant="outline" size="sm" onClick={newConversation}>
            Nova Conversa
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Histórico ({conversations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-4">
            <ScrollArea className="h-[400px] p-4 border rounded-lg bg-gradient-card">
              {currentMessages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Pergunte sobre suas finanças, notas ou metas!</p>
                  <p className="text-sm mt-2">Ex: "Quanto gastei este mês?" ou "Mostre minhas notas sobre projetos"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg transition-all ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-8 shadow-lg"
                          : "bg-gradient-to-br from-secondary to-secondary/80 mr-8 shadow-md border border-border/50"
                      }`}
                    >
                      <div className="text-sm leading-relaxed space-y-2">
                        {msg.content.split('\n').map((paragraph, pIdx) => (
                          paragraph.trim() && (
                            <p key={pIdx} className="whitespace-pre-wrap">
                              {paragraph}
                            </p>
                          )
                        ))}
                      </div>
                      <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
                        <span className={msg.role === "user" ? "text-primary-foreground/80" : "text-muted-foreground"}>
                          {new Date(msg.timestamp).toLocaleTimeString("pt-BR")}
                        </span>
                      </p>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Pensando...</span>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Pergunte algo sobre seus dados..."
                disabled={loading}
                className="transition-all focus:shadow-primary"
              />
              <Button onClick={sendMessage} disabled={loading || !input.trim()} className="shadow-sm">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[450px]">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma conversa salva ainda.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-3 border rounded-lg hover:bg-secondary transition-all cursor-pointer group"
                      onClick={() => loadConversation(conv)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium truncate">{conv.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conv.created_at).toLocaleDateString("pt-BR")} - {conv.messages.length} mensagens
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
