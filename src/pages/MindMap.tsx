import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Network, Download, Filter, Link2, Trash2 } from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linked_notes: string[];
  manual_connections: string[];
  color?: string;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  tags: string[];
}

interface GraphLink {
  source: string;
  target: string;
  type: "auto" | "manual";
}

const MindMap = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [connectMode, setConnectMode] = useState(false);
  const [selectedNodeForConnection, setSelectedNodeForConnection] = useState<string | null>(null);
  const [deletingNote, setDeletingNote] = useState<string | null>(null);
  const { toast } = useToast();
  const fgRef = useRef<any>();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      buildGraphData();
      extractAllTags();
    }
  }, [notes, filterTag]);

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, tags, linked_notes, manual_connections, color")
      .eq("user_id", user.id);

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

  const extractAllTags = () => {
    const tags = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  };

  const getColorForTags = (tags: string[]): string => {
    if (!tags || tags.length === 0) return "hsl(var(--primary))";
    
    const colorMap: { [key: string]: string } = {
      trabalho: "#3b82f6",
      pessoal: "#8b5cf6",
      urgente: "#ef4444",
      ideia: "#f59e0b",
      projeto: "#10b981",
    };

    const firstTag = tags[0].toLowerCase();
    return colorMap[firstTag] || "hsl(var(--primary))";
  };

  const buildGraphData = () => {
    let filteredNotes = notes;
    
    if (filterTag) {
      filteredNotes = notes.filter((note) => 
        note.tags?.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase()))
      );
    }

    const nodes: GraphNode[] = filteredNotes.map((note) => ({
      id: note.id,
      name: note.title,
      val: 15,
      color: note.color || getColorForTags(note.tags || []),
      tags: note.tags || [],
    }));

    const links: GraphLink[] = [];
    
    // Automatic links from [[note_title]] pattern
    filteredNotes.forEach((note) => {
      const linkPattern = /\[\[([^\]]+)\]\]/g;
      const matches = note.content.matchAll(linkPattern);
      
      for (const match of matches) {
        const linkedTitle = match[1];
        const linkedNote = filteredNotes.find((n) => 
          n.title.toLowerCase() === linkedTitle.toLowerCase()
        );
        
        if (linkedNote && !links.some(l => 
          (l.source === note.id && l.target === linkedNote.id) ||
          (l.source === linkedNote.id && l.target === note.id)
        )) {
          links.push({
            source: note.id,
            target: linkedNote.id,
            type: "auto",
          });
        }
      }

      // Manual connections
      note.manual_connections?.forEach((connId) => {
        const connNote = filteredNotes.find((n) => n.id === connId);
        if (connNote && !links.some(l => 
          (l.source === note.id && l.target === connId) ||
          (l.source === connId && l.target === note.id)
        )) {
          links.push({
            source: note.id,
            target: connId,
            type: "manual",
          });
        }
      });
    });

    setGraphData({ nodes, links });
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ notes, graphData }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `time-up-mind-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Exportação Concluída",
      description: "Seus dados foram exportados com sucesso!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mapa Mental
            </h1>
            <p className="text-muted-foreground">
              Visualize as conexões entre suas notas
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setConnectMode(!connectMode);
                setSelectedNodeForConnection(null);
              }} 
              variant={connectMode ? "default" : "outline"} 
              className="gap-2"
            >
              <Link2 className="h-4 w-4" />
              {connectMode ? "Cancelar Conexão" : "Conectar Notas"}
            </Button>
            <Button onClick={exportData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Dados
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="max-w-xs"
          />
          {allTags.slice(0, 5).map((tag) => (
            <Badge
              key={tag}
              variant={filterTag === tag ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Carregando...
            </CardContent>
          </Card>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma nota encontrada. Crie notas com links [[nota]] para visualizar conexões!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Visualização de Conexões
              </CardTitle>
              <CardDescription>
                Use [[título da nota]] em suas notas para criar links automáticos.
                Clique e arraste para explorar. Use a roda do mouse para zoom.
                {connectMode && <span className="block mt-2 text-primary font-medium">🔗 Modo Conexão: Clique em duas notas para conectá-las manualmente</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[600px] bg-gradient-to-br from-background to-primary/5 rounded-lg border border-primary/20 shadow-inner">
                <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  nodeLabel="name"
                  nodeColor="color"
                  linkColor={(link: any) => 
                    link.type === "manual" 
                      ? "hsl(var(--primary))" 
                      : "hsl(var(--muted-foreground))"
                  }
                  linkWidth={(link: any) => link.type === "manual" ? 3 : 2}
                  linkCurvature={0.2}
                  linkDirectionalParticles={(link: any) => link.type === "manual" ? 2 : 0}
                  linkDirectionalParticleSpeed={0.01}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 14 / globalScale;
                    ctx.font = `bold ${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;

                    // Draw node circle with glow
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = node.color;
                    ctx.fillStyle = node.color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                    ctx.fill();
                    
                    // Reset shadow
                    ctx.shadowBlur = 0;

                    // Draw label background
                    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    ctx.fillRect(
                      node.x - textWidth / 2 - 4,
                      node.y + 12,
                      textWidth + 8,
                      fontSize + 4
                    );

                    // Draw label text
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(label, node.x, node.y + 12 + fontSize / 2);
                  }}
                  onNodeClick={async (node: any) => {
                    if (connectMode) {
                      if (!selectedNodeForConnection) {
                        setSelectedNodeForConnection(node.id);
                        toast({
                          title: "Modo Conexão Ativado",
                          description: `"${node.name}" selecionada. Clique em outra nota para conectar.`,
                        });
                      } else {
                        // Create manual connection
                        const sourceNote = notes.find(n => n.id === selectedNodeForConnection);
                        if (sourceNote && node.id !== selectedNodeForConnection) {
                          const currentConnections = sourceNote.manual_connections || [];
                          if (!currentConnections.includes(node.id)) {
                            await supabase
                              .from("notes")
                              .update({
                                manual_connections: [...currentConnections, node.id]
                              })
                              .eq("id", selectedNodeForConnection);
                            
                            toast({
                              title: "✨ Conexão Criada!",
                              description: "As notas foram conectadas com sucesso",
                            });
                            fetchNotes();
                          } else {
                            toast({
                              title: "Conexão já existe",
                              description: "Essas notas já estão conectadas",
                              variant: "destructive",
                            });
                          }
                        }
                        setSelectedNodeForConnection(null);
                        setConnectMode(false);
                      }
                    } else {
                      const note = notes.find((n) => n.id === node.id);
                      if (note) {
                        toast({
                          title: note.title,
                          description: `${note.content.substring(0, 150)}...`,
                        });
                      }
                    }
                  }}
                  onNodeRightClick={async (node: any) => {
                    const note = notes.find(n => n.id === node.id);
                    if (note && confirm(`Deseja excluir a nota "${note.title}"?`)) {
                      setDeletingNote(node.id);
                      const { error } = await supabase
                        .from("notes")
                        .delete()
                        .eq("id", node.id);
                      
                      if (error) {
                        toast({
                          title: "Erro ao excluir",
                          description: error.message,
                          variant: "destructive",
                        });
                      } else {
                        toast({
                          title: "Nota excluída",
                          description: "A nota foi removida do mapa mental.",
                        });
                        fetchNotes();
                      }
                      setDeletingNote(null);
                    }
                  }}
                  onNodeHover={(node: any) => {
                    if (fgRef.current) {
                      fgRef.current.d3Force('charge').strength(node ? -400 : -200);
                    }
                  }}
                />
              </div>
              
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-muted-foreground" />
                  <span className="text-muted-foreground">Conexão automática</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-primary" />
                  <span className="text-muted-foreground">Conexão manual</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MindMap;