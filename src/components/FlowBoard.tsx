import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, Download, Trash2, Edit2, Grip } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [blocks, setBlocks] = useState<FlowBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<FlowBlock | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  useEffect(() => {
    loadFlowBoard();
  }, []);

  const loadFlowBoard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("title", "__flowboard_data__")
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

  const saveFlowBoard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const flowData = { blocks };

    const { data: existing } = await supabase
      .from("notes")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", "__flowboard_data__")
      .single();

    if (existing) {
      await supabase
        .from("notes")
        .update({ content: JSON.stringify(flowData) })
        .eq("id", existing.id);
    } else {
      await supabase.from("notes").insert({
        user_id: user.id,
        title: "__flowboard_data__",
        content: JSON.stringify(flowData),
        tags: ["__system__"],
      });
    }

    toast({
      title: "Salvo!",
      description: "Seu fluxo foi salvo com sucesso.",
    });
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

  const exportAsPNG = async () => {
    toast({
      title: "Exportando...",
      description: "A funcionalidade de exportação está sendo preparada.",
    });
  };

  const startDragging = (e: React.MouseEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const startX = e.clientX - block.x;
    const startY = e.clientY - block.y;

    const handleMouseMove = (e: MouseEvent) => {
      updateBlockPosition(blockId, e.clientX - startX, e.clientY - startY);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Fluxos Visuais
          </h2>
          <p className="text-muted-foreground">
            Crie e conecte blocos de ideias visualmente
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={saveFlowBoard}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          <Button variant="outline" onClick={exportAsPNG}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PNG
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
        <CardContent className="p-0">
          <div 
            ref={canvasRef}
            className="relative w-full h-[600px] bg-gradient-to-br from-background to-primary/5 overflow-hidden rounded-lg"
          >
            {/* Render connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
                  >
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold line-clamp-2">
                        {block.title}
                      </CardTitle>
                      <Grip className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {block.content && (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {block.content}
                      </p>
                    )}
                    <div className="flex gap-1">
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

            {blocks.length === 0 && (
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
    </div>
  );
};
