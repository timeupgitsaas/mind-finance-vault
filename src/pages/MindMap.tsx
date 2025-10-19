import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network } from "lucide-react";
import ForceGraph2D from "react-force-graph-2d";

interface Note {
  id: string;
  title: string;
  content: string;
  linked_notes: string[];
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
}

const MindMap = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({
    nodes: [],
    links: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const fgRef = useRef<any>();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      buildGraphData();
    }
  }, [notes]);

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, linked_notes")
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

  const buildGraphData = () => {
    const nodes: GraphNode[] = notes.map((note) => ({
      id: note.id,
      name: note.title,
      val: 10,
      color: "hsl(var(--primary))",
    }));

    const links: GraphLink[] = [];
    
    // Extract links from content using [[note_title]] pattern
    notes.forEach((note) => {
      const linkPattern = /\[\[([^\]]+)\]\]/g;
      const matches = note.content.matchAll(linkPattern);
      
      for (const match of matches) {
        const linkedTitle = match[1];
        const linkedNote = notes.find((n) => n.title.toLowerCase() === linkedTitle.toLowerCase());
        
        if (linkedNote) {
          links.push({
            source: note.id,
            target: linkedNote.id,
          });
        }
      }
    });

    setGraphData({ nodes, links });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Mapa Mental</h1>
          <p className="text-muted-foreground">
            Visualize as conexões entre suas notas
          </p>
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
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Visualização de Conexões</CardTitle>
              <CardDescription>
                Use [[título da nota]] em suas notas para criar links. Clique e arraste para explorar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[600px] bg-background rounded-lg border">
                <ForceGraph2D
                  ref={fgRef}
                  graphData={graphData}
                  nodeLabel="name"
                  nodeColor="color"
                  linkColor={() => "hsl(var(--border))"}
                  linkWidth={2}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.4);

                    ctx.fillStyle = node.color;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                    ctx.fill();

                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "hsl(var(--foreground))";
                    ctx.fillText(label, node.x, node.y + 10);
                  }}
                  onNodeClick={(node: any) => {
                    const note = notes.find((n) => n.id === node.id);
                    if (note) {
                      toast({
                        title: note.title,
                        description: note.content.substring(0, 100) + "...",
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MindMap;
