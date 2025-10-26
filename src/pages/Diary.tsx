import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2, BookOpen, Smile, Meh, Frown, SmilePlus, AngryIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStatistics } from "@/hooks/useStatistics";
import { FolderSidebar } from "@/components/FolderSidebar";
import Navbar from "@/components/Navbar";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string | null;
  tags: string[];
  folder_ids: string[];
  date: string;
  created_at: string;
}

const MOODS = [
  { value: "great", label: "Ótimo", icon: SmilePlus, color: "#10B981" },
  { value: "good", label: "Bom", icon: Smile, color: "#3B82F6" },
  { value: "neutral", label: "Neutro", icon: Meh, color: "#6B7280" },
  { value: "bad", label: "Ruim", icon: Frown, color: "#F59E0B" },
  { value: "terrible", label: "Péssimo", icon: AngryIcon, color: "#EF4444" },
];

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string>("neutral");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { trackActivity } = useStatistics("diary");

  useEffect(() => {
    loadEntries();
  }, [selectedFolderId]);

  const loadEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (selectedFolderId) {
      query = query.contains("folder_ids", [selectedFolderId]);
    }

    const { data } = await query;
    if (data) setEntries(data);
  };

  const handleNewEntry = () => {
    setIsEditing(true);
    setSelectedEntry(null);
    setTitle("");
    setContent("");
    setMood("neutral");
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha título e conteúdo.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const entryData = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      mood,
      folder_ids: selectedFolderId ? [selectedFolderId] : [],
      date: new Date().toISOString().split("T")[0],
    };

    if (selectedEntry) {
      // Atualizar
      await supabase
        .from("diary_entries")
        .update(entryData)
        .eq("id", selectedEntry.id);
    } else {
      // Criar
      await supabase.from("diary_entries").insert(entryData);
      await trackActivity({ itemsCreated: 1, wordsWritten: content.split(/\s+/).length });
    }

    toast({
      title: "Salvo!",
      description: "Entrada do diário salva com sucesso.",
    });

    setIsEditing(false);
    loadEntries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta entrada?")) return;

    await supabase.from("diary_entries").delete().eq("id", id);

    toast({
      title: "Excluído",
      description: "Entrada removida do diário.",
    });

    loadEntries();
  };

  const getMoodIcon = (moodValue: string | null) => {
    const mood = MOODS.find((m) => m.value === moodValue) || MOODS[2];
    const Icon = mood.icon;
    return <Icon className="w-5 h-5" style={{ color: mood.color }} />;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <FolderSidebar
        selectedFolderId={selectedFolderId}
        onFolderSelect={setSelectedFolderId}
        contentType="diary"
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              📖 Meu Diário
            </h1>
            <p className="text-muted-foreground">Registre seus pensamentos e emoções</p>
          </div>

          <Button onClick={handleNewEntry}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Entrada
          </Button>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedEntry ? "Editar Entrada" : "Nova Entrada do Diário"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Título da entrada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div>
                <label className="text-sm font-medium mb-2 block">Como você está se sentindo?</label>
                <div className="flex gap-2">
                  {MOODS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <Button
                        key={m.value}
                        variant={mood === m.value ? "default" : "outline"}
                        size="lg"
                        onClick={() => setMood(m.value)}
                        className="flex-1"
                      >
                        <Icon className="w-5 h-5 mr-2" style={{ color: mood === m.value ? "white" : m.color }} />
                        {m.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Textarea
                placeholder="Escreva seus pensamentos..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="resize-none"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMoodIcon(entry.mood)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent
                  onClick={() => {
                    setSelectedEntry(entry);
                    setTitle(entry.title);
                    setContent(entry.content);
                    setMood(entry.mood || "neutral");
                    setIsEditing(true);
                  }}
                >
                  <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {entries.length === 0 && (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma entrada ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Comece a registrar seus pensamentos e emoções
                </p>
                <Button onClick={handleNewEntry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Entrada
                </Button>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
