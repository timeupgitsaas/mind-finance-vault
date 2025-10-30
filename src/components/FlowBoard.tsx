import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, Download, Trash2, Edit2, Grip, ZoomIn, ZoomOut, Maximize2, Eye, FolderInput, Upload } from "lucide-react";
import { ImportExportButtons } from "@/components/ImportExportButtons";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FlowBlock {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

interface FlowBoardData {
  id: string;
  user_id: string;
  blocks: FlowBlock[];
  created_at: string;
  updated_at: string;
}

export const FlowBoard = () => {
  const [flows, setFlows] = useState<Array<{ id: string; name: string; updated_at: string }>>([]);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<FlowBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<FlowBlock | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateFlowOpen, setIsCreateFlowOpen] = useState(false);
  const [isBlockDetailOpen, setIsBlockDetailOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [newFlowName, setNewFlowName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  useEffect(() => {
    loadFlowsList();
  }, []);

  useEffect(() => {
    if (currentFlowId) {
      loadFlowBoard(currentFlowId);
    }
  }, [currentFlowId]);

  const loadFlowsList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .contains("tags", ["fluxo-visual"])
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) {
      setFlows(data.map(d => ({ id: d.id, name: d.title, updated_at: d.updated_at })));
      if (!currentFlowId) {
        setCurrentFlowId(data[0].id);
      }
    }
  };

  const loadFlowBoard = async (flowId: string) => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", flowId)
      .single();

    if (data && data.content) {
      try {
        const parsed = JSON.parse(data.content);
        setBlocks(parsed.blocks || []);
      } catch (e) {
        console.error("Error parsing flowboard data:", e);
      }
    }
  };

  const createNewFlow = async () => {
    if (!newFlowName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("notes").insert({
      user_id: user.id,
      title: newFlowName,
      content: JSON.stringify({ blocks: [] }),
      tags: ["fluxo-visual"],
    }).select().single();

    if (data) {
      setFlows([{ id: data.id, name: data.title, updated_at: data.updated_at }, ...flows]);
      setCurrentFlowId(data.id);
      setBlocks([]);
      setNewFlowName("");
      setIsCreateFlowOpen(false);
      
      toast({
        title: "Fluxo criado!",
        description: `"${newFlowName}" foi criado com sucesso.`,
      });
    }
  };

  const saveFlowBoard = async () => {
    if (!currentFlowId) return;

    const flowData = { blocks };

    await supabase
      .from("notes")
      .update({ content: JSON.stringify(flowData) })
      .eq("id", currentFlowId);

    toast({
      title: "Salvo!",
      description: "Seu fluxo foi salvo com sucesso.",
    });
    
    loadFlowsList();
  };

  const createBlock = () => {
    if (!editTitle.trim()) return;

    const newBlock: FlowBlock = {
      id: crypto.randomUUID(),
      title: editTitle,
      content: editContent,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      connections: [],
    };

    setBlocks([...blocks, newBlock]);
    setEditTitle("");
    setEditContent("");
    setIsDialogOpen(false);
    
    toast({
      title: "Bloco criado!",
      description: "Novo bloco adicionado ao fluxo.",
    });
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    toast({
      title: "Bloco removido",
      description: "O bloco foi excluído do fluxo.",
    });
  };

  const updateBlockPosition = (id: string, x: number, y: number) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, x, y } : b));
  };

  const handleConnect = (toId: string) => {
    if (!connectingFrom || connectingFrom === toId) {
      setConnectingFrom(null);
      return;
    }

    setBlocks(blocks.map(b => {
      if (b.id === connectingFrom && !b.connections.includes(toId)) {
        return { ...b, connections: [...b.connections, toId] };
      }
      return b;
    }));

    toast({
      title: "Conectado!",
      description: "Blocos conectados com sucesso.",
    });

    setConnectingFrom(null);
  };

  const handleDisconnect = (blockId: string, targetId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, connections: b.connections.filter(id => id !== targetId) };
      }
      return b;
    }));

    toast({
      title: "🔗 Desconectado!",
      description: "Conexão removida com sucesso.",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const exportAsPNG = async () => {
    toast({
      title: "Exportando...",
      description: "A funcionalidade de exportação está sendo preparada.",
    });
  };

  const startDragging = (e: React.MouseEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const startX = e.clientX / zoom - block.x;
    const startY = e.clientY / zoom - block.y;

    const handleMouseMove = (e: MouseEvent) => {
      updateBlockPosition(blockId, e.clientX / zoom - startX, e.clientY / zoom - startY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.3, zoom + delta), 3);
      setZoom(newZoom);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).classList.contains('flow-canvas')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Fluxos Visuais
            </h2>
            <p className="text-muted-foreground">
              Crie e conecte blocos de ideias visualmente
            </p>
          </div>
          {flows.length > 0 && (
            <Select value={currentFlowId || ""} onValueChange={setCurrentFlowId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar fluxo" />
              </SelectTrigger>
              <SelectContent>
                {flows.map(flow => (
                  <SelectItem key={flow.id} value={flow.id}>
                    {flow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreateFlowOpen} onOpenChange={setIsCreateFlowOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Novo Fluxo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Fluxo Visual</DialogTitle>
                <DialogDescription>
                  Como deseja nomear este fluxo visual?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do fluxo (ex: Planejamento 2025)"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createNewFlow()}
                />
                <div className="flex gap-2">
                  <Button onClick={createNewFlow} className="flex-1">
                    Criar Fluxo
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateFlowOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={saveFlowBoard} disabled={!currentFlowId}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          
          <ImportExportButtons module="flows" />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!currentFlowId}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Bloco
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Bloco</DialogTitle>
                <DialogDescription>
                  Adicione um novo bloco de ideia ao seu fluxo visual
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título do bloco"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Conteúdo do bloco (opcional)"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                />
                <Button onClick={createBlock} className="w-full">
                  Criar Bloco
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-xl border-primary/20">
        <CardContent className="p-0 relative">
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 z-10 flex gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-lg border">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}
              title="Diminuir zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm px-2 flex items-center">{Math.round(zoom * 100)}%</span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              title="Aumentar zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={resetView}
              title="Resetar visualização"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          <div 
            ref={canvasRef}
            className="flow-canvas relative w-full h-[600px] bg-gradient-to-br from-background to-primary/5 overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Render connections */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
              {blocks.map(block => 
                block.connections.map(targetId => {
                  const target = blocks.find(b => b.id === targetId);
                  if (!target) return null;
                  return (
                    <line
                      key={`${block.id}-${targetId}`}
                      x1={block.x + 80}
                      y1={block.y + 40}
                      x2={target.x + 80}
                      y2={target.y + 40}
                      stroke={block.color}
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                      opacity="0.6"
                    />
                  );
                })
              )}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                </marker>
              </defs>
            </svg>

            {/* Render blocks */}
            <div 
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
                width: '100%',
                height: '100%'
              }}
            >
              {blocks.map(block => (
                <div
                  key={block.id}
                  className="absolute cursor-move group"
                  style={{
                    left: `${block.x}px`,
                    top: `${block.y}px`,
                    width: "160px",
                  }}
                >
                <Card
                  className="shadow-lg hover:shadow-xl transition-all border-2"
                  style={{ borderColor: block.color }}
                  onClick={() => {
                    if (connectingFrom) {
                      handleConnect(block.id);
                    }
                  }}
                >
                  <CardHeader 
                    className="p-3 cursor-grab active:cursor-grabbing"
                    style={{ backgroundColor: `${block.color}20` }}
                    onMouseDown={(e) => startDragging(e, block.id)}
                    title={block.title}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold line-clamp-2">
                        {truncateText(block.title, 40)}
                      </CardTitle>
                      <Grip className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {block.content && (
                      <p 
                        className="text-xs text-muted-foreground line-clamp-3" 
                        title={block.content}
                      >
                        {truncateText(block.content, 150)}
                      </p>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlock(block);
                          setIsBlockDetailOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnectingFrom(connectingFrom === block.id ? null : block.id);
                        }}
                      >
                        {connectingFrom === block.id ? "Cancelar" : "Conectar"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(block.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              ))}
            </div>

            {blocks.length === 0 && !currentFlowId && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    Nenhum fluxo selecionado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Crie um novo fluxo para começar
                  </p>
                </div>
              </div>
            )}

            {blocks.length === 0 && currentFlowId && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    Nenhum bloco criado ainda
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique em "Novo Bloco" para começar
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {connectingFrom && (
        <Badge variant="secondary" className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          Clique em outro bloco para conectar
        </Badge>
      )}

      {/* Block Detail Modal */}
      <Dialog open={isBlockDetailOpen} onOpenChange={setIsBlockDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: selectedBlock?.color }}
              />
              {selectedBlock?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBlock?.content && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Conteúdo:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedBlock.content}
                </p>
              </div>
            )}
            
            {selectedBlock?.connections && selectedBlock.connections.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Conexões:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBlock.connections.map(connId => {
                    const connectedBlock = blocks.find(b => b.id === connId);
                    return connectedBlock ? (
                      <div key={connId} className="flex items-center gap-1">
                        <Badge 
                          variant="outline"
                          style={{ borderColor: connectedBlock.color }}
                        >
                          {connectedBlock.title}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDisconnect(selectedBlock.id, connId)}
                          title="Remover conexão"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBlockDetailOpen(false);
                  setTimeout(() => {
                    if (selectedBlock) {
                      deleteBlock(selectedBlock.id);
                    }
                  }, 200);
                }}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Bloco
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
