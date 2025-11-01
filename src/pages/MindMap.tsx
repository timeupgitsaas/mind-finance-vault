import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStatistics } from "@/hooks/useStatistics";
import Navbar from "@/components/Navbar";
import { FolderSidebar } from "@/components/FolderSidebar";
import { MindMapControls } from "@/components/MindMapControls";
import { MindMapCustomization } from "@/components/MindMapCustomization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Network, Download, Filter, Link2, Globe, FolderOpen } from "lucide-react";
import { ImportExportButtons } from "@/components/ImportExportButtons";
import ForceGraph2D from "react-force-graph-2d";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  linked_notes: string[];
  manual_connections: string[];
  folder_ids?: string[];
  color?: string;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  tags: string[];
  folder_ids?: string[];
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
  const [disconnectMode, setDisconnectMode] = useState(false);
  const [selectedNodeForConnection, setSelectedNodeForConnection] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [groupByFolder, setGroupByFolder] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [lineType, setLineType] = useState<"straight" | "curved">("curved");
  const [lineColor, setLineColor] = useState("hsl(var(--primary))");
  const [lineWidth, setLineWidth] = useState(3);
  const { toast } = useToast();
  const { trackActivity } = useStatistics("mindmap");
  const fgRef = useRef<any>();

  useEffect(() => {
    fetchNotes();
    trackActivity({});
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      buildGraphData();
      extractAllTags();
    }
  }, [notes, filterTag, selectedFolderId]);

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, tags, linked_notes, manual_connections, folder_ids, color")
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
    
    if (selectedFolderId) {
      filteredNotes = notes.filter((note) => 
        note.folder_ids?.includes(selectedFolderId)
      );
    }
    
    if (filterTag) {
      filteredNotes = filteredNotes.filter((note) => 
        note.tags?.some((tag) => tag.toLowerCase().includes(filterTag.toLowerCase()))
      );
    }

    const nodes: GraphNode[] = filteredNotes.map((note) => ({
      id: note.id,
      name: note.title.length > 30 ? note.title.substring(0, 30) + "..." : note.title,
      val: 15,
      color: note.color || getColorForTags(note.tags || []),
      tags: note.tags || [],
      folder_ids: note.folder_ids,
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

  const handleZoomIn = () => {
    if (fgRef.current && zoom < 3) {
      const newZoom = Math.min(zoom + 0.2, 3);
      fgRef.current.zoom(newZoom, 400);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current && zoom > 0.3) {
      const newZoom = Math.max(zoom - 0.2, 0.3);
      fgRef.current.zoom(newZoom, 400);
      setZoom(newZoom);
    }
  };

  const handleReset = () => {
    if (fgRef.current) {
      fgRef.current.zoom(1, 400);
      fgRef.current.centerAt(0, 0, 400);
      setZoom(1);
    }
  };

  const handleFit = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 50);
      const currentZoom = fgRef.current.zoom();
      setZoom(currentZoom);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const handleConnect = async (toId: string) => {
    if (!selectedNodeForConnection || selectedNodeForConnection === toId) {
      setSelectedNodeForConnection(null);
      return;
    }

    const sourceNote = notes.find(n => n.id === selectedNodeForConnection);
    if (sourceNote) {
      const currentConnections = sourceNote.manual_connections || [];
      if (!currentConnections.includes(toId)) {
        await supabase
          .from("notes")
          .update({
            manual_connections: [...currentConnections, toId]
          })
          .eq("id", selectedNodeForConnection);
        
        toast({
          title: "✨ Conexão Criada!",
          description: "As notas foram conectadas com sucesso",
        });
        trackActivity({ connectionsCreated: 1 });
        fetchNotes();
      }
    }
    setSelectedNodeForConnection(null);
    setConnectMode(false);
  };

  const handleDisconnect = async (sourceId: string, targetId: string) => {
    const sourceNote = notes.find(n => n.id === sourceId);
    if (sourceNote) {
      const currentConnections = sourceNote.manual_connections || [];
      const updatedConnections = currentConnections.filter(id => id !== targetId);
      
      await supabase
        .from("notes")
        .update({
          manual_connections: updatedConnections
        })
        .eq("id", sourceId);
      
      toast({
        title: "🔗 Conexão Removida",
        description: "A conexão foi removida com sucesso",
      });
      fetchNotes();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col lg:flex-row">
      <FolderSidebar 
        selectedFolderId={selectedFolderId}
        onFolderSelect={setSelectedFolderId}
        contentType="mindmaps"
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                🧠 Mapa de Conexões
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Visualize e conecte suas ideias de forma intuitiva
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => setGroupByFolder(!groupByFolder)}
                variant={groupByFolder ? "default" : "outline"} 
                className="gap-2 flex-1 sm:flex-none h-11"
              >
                {groupByFolder ? <FolderOpen className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                <span className="hidden xs:inline">{groupByFolder ? "Ver por Pasta" : "Ver Tudo"}</span>
              </Button>
              <Button 
                onClick={() => {
                  setConnectMode(!connectMode);
                  setSelectedNodeForConnection(null);
                }} 
                variant={connectMode ? "default" : "outline"} 
                className="gap-2 flex-1 sm:flex-none h-11"
              >
                <Link2 className="h-4 w-4" />
                <span className="hidden xs:inline">{connectMode ? "Cancelar" : "Conectar"}</span>
              </Button>
              <ImportExportButtons module="notes" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Filtrar por tag..."
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="flex-1 sm:max-w-xs h-11"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 5).map((tag) => (
                <Badge
                  key={tag}
                  variant={filterTag === tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors h-9 px-3"
                  onClick={() => setFilterTag(filterTag === tag ? "" : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
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
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <Card className="shadow-xl border-primary/20 relative overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Network className="h-5 w-5" />
                  Visualização de Conexões
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Use [[título da nota]] para criar links. Ctrl + Scroll para zoom. Space + Drag para mover.</span>
                  <span className="sm:hidden">Toque e arraste para navegar. Pinça para zoom.</span>
                  {connectMode && <span className="block mt-2 text-primary font-medium text-xs sm:text-sm">🔗 Clique em duas notas para conectá-las</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative p-2 sm:p-4 lg:p-6">
                 <div className="w-full h-[350px] sm:h-[450px] lg:h-[calc(100vh-400px)] bg-gradient-to-br from-background to-primary/5 rounded-lg border-2 border-primary/20 shadow-inner overflow-hidden relative touch-auto">
                  <MindMapControls
                    zoom={zoom}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onReset={handleReset}
                    onFit={handleFit}
                    onDisconnect={() => {
                      setDisconnectMode(!disconnectMode);
                      setConnectMode(false);
                      setSelectedNodeForConnection(null);
                      toast({
                        title: disconnectMode ? "Modo desconectar desativado" : "Modo desconectar ativado",
                        description: disconnectMode ? "Volte ao modo normal" : "Clique em uma conexão manual para removê-la",
                      });
                    }}
                    disconnectMode={disconnectMode}
                  />
                  
                  <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    width={1200}
                    height={600}
                    nodeLabel="name"
                    nodeColor="color"
                    linkColor={(link: any) => 
                      link.type === "manual" 
                        ? lineColor
                        : "hsl(var(--muted-foreground))"
                    }
                    linkWidth={(link: any) => link.type === "manual" ? lineWidth : 2}
                    linkCurvature={lineType === "curved" ? 0.2 : 0}
                    linkDirectionalParticles={(link: any) => link.type === "manual" ? 2 : 0}
                    linkDirectionalParticleSpeed={0.01}
                    d3AlphaDecay={0.02}
                    d3VelocityDecay={0.3}
                    cooldownTicks={100}
                    enableNodeDrag={true}
                    enableZoomInteraction={true}
                    enablePanInteraction={true}
                    onEngineStop={() => {
                      if (fgRef.current) {
                        fgRef.current.zoomToFit(400, 50);
                        const currentZoom = fgRef.current.zoom();
                        setZoom(currentZoom);
                      }
                    }}
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                      const label = node.name;
                      const maxWidth = 250;
                      const fontSize = 12 / globalScale;
                      ctx.font = `bold ${fontSize}px Sans-Serif`;
                      
                      // Truncate text if too long
                      const truncatedLabel = truncateText(label, 40);
                      const textWidth = Math.min(ctx.measureText(truncatedLabel).width, maxWidth / globalScale);

                      // Draw node circle with enhanced glow
                      ctx.shadowBlur = 15;
                      ctx.shadowColor = node.color;
                      ctx.fillStyle = node.color;
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI, false);
                      ctx.fill();
                      
                      // Reset shadow
                      ctx.shadowBlur = 0;

                      // Draw label background with padding
                      const padding = 6 / globalScale;
                      ctx.fillStyle = "rgba(10, 10, 11, 0.95)";
                      ctx.fillRect(
                        node.x - textWidth / 2 - padding,
                        node.y + 14,
                        textWidth + padding * 2,
                        fontSize + padding
                      );

                      // Draw border
                      ctx.strokeStyle = node.color;
                      ctx.lineWidth = 1 / globalScale;
                      ctx.strokeRect(
                        node.x - textWidth / 2 - padding,
                        node.y + 14,
                        textWidth + padding * 2,
                        fontSize + padding
                      );

                      // Draw label text
                      ctx.textAlign = "center";
                      ctx.textBaseline = "middle";
                      ctx.fillStyle = "#ffffff";
                      ctx.fillText(truncatedLabel, node.x, node.y + 14 + fontSize / 2 + padding / 2);
                    }}
                    onNodeClick={async (node: any) => {
                      if (connectMode) {
                        if (!selectedNodeForConnection) {
                          setSelectedNodeForConnection(node.id);
                          toast({
                            title: "Primeira nota selecionada",
                            description: `"${truncateText(node.name, 30)}" - Clique em outra para conectar`,
                          });
                        } else {
                          await handleConnect(node.id);
                        }
                      } else {
                        const note = notes.find((n) => n.id === node.id);
                        if (note) {
                          toast({
                            title: truncateText(note.title, 40),
                            description: truncateText(note.content, 150),
                          });
                        }
                      }
                    }}
                    onNodeRightClick={(node: any) => {
                      const note = notes.find((n) => n.id === node.id);
                      if (note && note.manual_connections && note.manual_connections.length > 0) {
                        const connectionsText = note.manual_connections
                          .map(connId => {
                            const connNote = notes.find(n => n.id === connId);
                            return connNote ? connNote.title : 'Nota desconhecida';
                          })
                          .join(', ');
                        
                        toast({
                          title: "Gerenciar Conexões",
                          description: `Esta nota está conectada a: ${connectionsText}. Ative o modo Conectar e clique novamente para remover conexões.`,
                        });
                      }
                    }}
                    onLinkClick={(link: any) => {
                      if (link.type === "manual") {
                        const sourceNote = notes.find(n => n.id === link.source.id || n.id === link.source);
                        const targetNote = notes.find(n => n.id === link.target.id || n.id === link.target);
                        
                        if (sourceNote && targetNote) {
                          const confirmed = window.confirm(
                            `Deseja remover a conexão entre "${truncateText(sourceNote.title, 30)}" e "${truncateText(targetNote.title, 30)}"?`
                          );
                          
                          if (confirmed) {
                            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
                            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
                            handleDisconnect(sourceId, targetId);
                          }
                        }
                      }
                    }}
                    onZoom={(zoom: any) => setZoom(zoom.k)}
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
                </div>
                
                <div className="lg:col-span-1 order-1 lg:order-2">
                  <MindMapCustomization
                    lineType={lineType}
                    lineColor={lineColor}
                    lineWidth={lineWidth}
                    onLineTypeChange={setLineType}
                    onLineColorChange={setLineColor}
                    onLineWidthChange={setLineWidth}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindMap;
