import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/useAutoSave";
import Navbar from "@/components/Navbar";
import { NoteSuggestions } from "@/components/NoteSuggestions";
import { AILoader } from "@/components/AILoader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Search, Tag, Wand2, Minimize2, Maximize2, Loader2, Sparkles, Download, Trash2 } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  manual_connections?: string[];
  ai_suggested_connections?: string[];
  color?: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  // Auto-save for editing mode
  const autoSave = async () => {
    if (selectedNote && content) {
      const tagsArray = tags.split(",").map((t) => t.trim()).filter((t) => t);
      
      await supabase
        .from("notes")
        .update({
          title,
          content,
          tags: tagsArray,
        })
        .eq("id", selectedNote.id);
    }
  };

  useAutoSave({
    content: `${title}${content}${tags}`,
    onSave: autoSave,
    delay: 3000,
  });

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar notas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handleCreateNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tagsArray = tags.split(",").map((t) => t.trim()).filter((t) => t);

    const { error } = await supabase.from("notes").insert({
      user_id: user.id,
      title: title || "Nova Nota",
      content,
      tags: tagsArray,
    });

    if (error) {
      toast({
        title: "Erro ao criar nota",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nota criada!",
        description: "Sua nota foi salva com sucesso.",
      });
      setTitle("");
      setContent("");
      setTags("");
      setIsDialogOpen(false);
      fetchNotes();
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;

    const tagsArray = tags.split(",").map((t) => t.trim()).filter((t) => t);

    const { error } = await supabase
      .from("notes")
      .update({
        title,
        content,
        tags: tagsArray,
      })
      .eq("id", selectedNote.id);

    if (error) {
      toast({
        title: "Erro ao atualizar nota",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Nota atualizada!",
        description: "Suas alterações foram salvas.",
      });
      setSelectedNote(null);
      fetchNotes();
    }
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(", "));
  };

  const closeEditor = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setTags("");
    setFocusMode(false);
  };

  const correctTextWithAI = async () => {
    if (!content) {
      toast({
        title: "Nada para corrigir",
        description: "Escreva algo primeiro!",
        variant: "destructive",
      });
      return;
    }

    setIsCorrecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("ai-text-correction", {
        body: { text: content },
      });

      if (error) throw error;

      setContent(data.correctedText);
      toast({
        title: "Texto corrigido!",
        description: "A IA revisou seu texto.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao corrigir texto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCorrecting(false);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedNote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {!focusMode && <Navbar />}
        <div className={`${focusMode ? "h-screen" : "container"} mx-auto p-6 space-y-4 animate-fade-in`}>
          <div className="flex items-center justify-between">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
              placeholder="Título da nota"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFocusMode(!focusMode)}
                title={focusMode ? "Sair do modo foco" : "Modo foco"}
                className="transition-transform hover:scale-105"
              >
                {focusMode ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={correctTextWithAI}
                disabled={isCorrecting}
                className="gap-2 transition-all hover:border-primary"
              >
                {isCorrecting ? (
                  <AILoader />
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Corrigir com IA
                  </>
                )}
              </Button>
              <Button onClick={handleUpdateNote} className="gap-2">
                Salvar
              </Button>
              <Button variant="outline" onClick={closeEditor}>
                Fechar
              </Button>
            </div>
          </div>

          {!focusMode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (separadas por vírgula)"
                  className="max-w-md"
                />
              </div>
              
              <NoteSuggestions 
                noteId={selectedNote.id}
                onConnectionAccept={async (targetNoteId) => {
                  const currentConnections = selectedNote.manual_connections || [];
                  if (!currentConnections.includes(targetNoteId)) {
                    await supabase
                      .from("notes")
                      .update({
                        manual_connections: [...currentConnections, targetNoteId]
                      })
                      .eq("id", selectedNote.id);
                    
                    fetchNotes();
                  }
                }}
              />
            </div>
          )}

          <Card className="shadow-xl border-primary/20 backdrop-blur-sm">
            <CardContent className="p-6">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={focusMode ? "calc(100vh - 200px)" : 600}
                preview="edit"
              />
            </CardContent>
          </Card>
          
          {!focusMode && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span>Salvamento automático ativado</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Notas
            </h1>
            <p className="text-muted-foreground">Organize suas ideias e pensamentos</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                const dataStr = JSON.stringify(notes, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
                toast({
                  title: "Exportação Concluída",
                  description: "Suas notas foram exportadas!",
                });
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Nota
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Criar Nova Nota
                  </DialogTitle>
                  <DialogDescription>
                    Escreva suas ideias usando Markdown. Use [[título]] para criar links entre notas.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da nota"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Tags (separadas por vírgula)"
                    />
                  </div>
                  
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || "")}
                    height={400}
                  />
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateNote}>
                      Criar Nota
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-md border-primary/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar notas por título, conteúdo ou tags..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <AILoader />
              <p className="mt-4 text-muted-foreground">Carregando notas...</p>
            </CardContent>
          </Card>
        ) : filteredNotes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm ? "Nenhuma nota encontrada" : "Nenhuma nota criada ainda. Crie sua primeira nota!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="relative cursor-pointer hover:shadow-xl hover:border-primary/40 transition-all hover:scale-[1.02] group"
                onClick={() => openNote(note)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm("Deseja realmente excluir esta nota?")) {
                      const { error } = await supabase
                        .from("notes")
                        .delete()
                        .eq("id", note.id);
                      
                      if (error) {
                        toast({
                          title: "Erro ao excluir",
                          description: error.message,
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Nota excluída",
                          description: "A nota foi removida com sucesso.",
                        });
                        fetchNotes();
                      }
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <CardHeader>
                  <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors pr-8">
                    {note.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {note.content.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {note.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
