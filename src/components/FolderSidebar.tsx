import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { CreateFolderModal } from "./CreateFolderModal";
import { useToast } from "@/hooks/use-toast";

interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  content_types: string[];
  count?: number;
}

interface FolderSidebarProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  contentType?: string; // 'notes', 'flows', 'mindmaps', 'diary'
}

export const FolderSidebar = ({ selectedFolderId, onFolderSelect, contentType }: FolderSidebarProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadFolders();
  }, [contentType]);

  const loadFolders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Carregar pastas
    const { data: foldersData } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (foldersData) {
      // Carregar contagens para cada pasta
      const foldersWithCount = await Promise.all(
        foldersData.map(async (folder) => {
          let count = 0;
          
          if (contentType === "notes" || !contentType) {
            const { count: notesCount } = await supabase
              .from("notes")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .contains("folder_ids", [folder.id]);
            count += notesCount || 0;
          }
          
          if (contentType === "diary" || !contentType) {
            const { count: diaryCount } = await supabase
              .from("diary_entries")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .contains("folder_ids", [folder.id]);
            count += diaryCount || 0;
          }

          return { ...folder, count };
        })
      );

      setFolders(foldersWithCount);

      // Carregar contagem total
      let total = 0;
      if (contentType === "notes" || !contentType) {
        const { count } = await supabase
          .from("notes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        total += count || 0;
      }
      if (contentType === "diary" || !contentType) {
        const { count } = await supabase
          .from("diary_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        total += count || 0;
      }
      setTotalCount(total);
    }
  };

  const handleFolderCreated = () => {
    loadFolders();
    setIsCreateModalOpen(false);
    toast({
      title: "Pasta criada!",
      description: "Nova pasta adicionada com sucesso.",
    });
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-card flex flex-col items-center py-4 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          title="Expandir pastas"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">📁 MINHAS PASTAS</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            title="Recolher pastas"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* Todas */}
            <Button
              variant={selectedFolderId === null ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onFolderSelect(null)}
            >
              <span className="mr-2">📊</span>
              <span className="flex-1 text-left">Todas</span>
              <span className="text-xs text-muted-foreground">({totalCount})</span>
            </Button>

            {/* Lista de pastas */}
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolderId === folder.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onFolderSelect(folder.id)}
                style={{
                  borderLeft: selectedFolderId === folder.id ? `3px solid ${folder.color}` : "none",
                }}
              >
                <span className="mr-2">{folder.icon}</span>
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <span className="text-xs text-muted-foreground">({folder.count || 0})</span>
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-2 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Pasta
          </Button>
        </div>
      </div>

      <CreateFolderModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onFolderCreated={handleFolderCreated}
      />
    </>
  );
};
