import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Search, Tag } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

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
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedNote) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-0 bg-transparent focus-visible:ring-0"
              placeholder="Título da nota"
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdateNote}>Salvar</Button>
              <Button variant="outline" onClick={closeEditor}>
                Fechar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (separadas por vírgula)"
              className="max-w-md"
            />
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={600}
                preview="edit"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notas</h1>
            <p className="text-muted-foreground">Organize suas ideias e pensamentos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Nota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Nota</DialogTitle>
                <DialogDescription>
                  Escreva suas ideias usando Markdown
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da nota"
                />
                
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Tags (separadas por vírgula)"
                />
                
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

        <Card className="shadow-md">
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
            <CardContent className="py-8 text-center text-muted-foreground">
              Carregando...
            </CardContent>
          </Card>
        ) : filteredNotes.length === 0 ? (
          <Card>
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
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => openNote(note)}
              >
                <CardHeader>
                  <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {note.content.substring(0, 100)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary rounded-full"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
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
