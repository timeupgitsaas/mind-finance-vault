import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Copy, FolderPlus } from "lucide-react";

interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  content_types: string[];
}

interface FolderManagementProps {
  folders: Folder[];
  onRefresh: () => void;
}

export const FolderManagement = ({ folders, onRefresh }: FolderManagementProps) => {
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const [deleteAction, setDeleteAction] = useState<"move" | "delete">("move");
  const [folderName, setFolderName] = useState("");
  const [folderIcon, setFolderIcon] = useState("📁");
  const [folderColor, setFolderColor] = useState("#8B5CF6");
  const [contentTypes, setContentTypes] = useState<string[]>(["notes"]);
  const { toast } = useToast();

  const icons = ["📁", "📊", "💼", "🏠", "📚", "🎯", "💡", "🎨", "🔬", "🎭", "🚀", "⚡"];
  const colors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

  const handleEditFolder = async () => {
    if (!editingFolder || !folderName.trim()) return;

    const { error } = await supabase
      .from("folders")
      .update({
        name: folderName,
        icon: folderIcon,
        color: folderColor,
        content_types: contentTypes,
      })
      .eq("id", editingFolder.id);

    if (error) {
      toast({
        title: "Erro ao editar pasta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Pasta editada!",
        description: `"${folderName}" foi atualizada com sucesso.`,
      });
      setEditingFolder(null);
      onRefresh();
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingFolder) return;

    if (deleteAction === "move") {
      // Mover conteúdo para "Sem Pasta" (remover folder_ids)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Atualizar notas
      await supabase
        .from("notes")
        .update({ folder_ids: [] })
        .contains("folder_ids", [deletingFolder.id])
        .eq("user_id", user.id);

      // Atualizar entradas de diário
      await supabase
        .from("diary_entries")
        .update({ folder_ids: [] })
        .contains("folder_ids", [deletingFolder.id])
        .eq("user_id", user.id);
    }

    // Deletar a pasta
    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", deletingFolder.id);

    if (error) {
      toast({
        title: "Erro ao excluir pasta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "🗑️ Pasta excluída!",
        description: deleteAction === "move" 
          ? "O conteúdo foi movido para 'Sem Pasta'"
          : "A pasta e seu conteúdo foram excluídos",
      });
      setDeletingFolder(null);
      onRefresh();
    }
  };

  const handleDuplicateFolder = async (folder: Folder) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("folders").insert({
      user_id: user.id,
      name: `${folder.name} (cópia)`,
      icon: folder.icon,
      color: folder.color,
      content_types: folder.content_types,
    });

    if (error) {
      toast({
        title: "Erro ao duplicar pasta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "✅ Pasta duplicada!",
        description: `"${folder.name} (cópia)" foi criada.`,
      });
      onRefresh();
    }
  };

  return (
    <>
      <div className="space-y-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{folder.icon}</span>
              <div>
                <p className="font-medium">{folder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {folder.content_types.join(", ")}
                </p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingFolder(folder);
                  setFolderName(folder.name);
                  setFolderIcon(folder.icon);
                  setFolderColor(folder.color);
                  setContentTypes(folder.content_types);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDuplicateFolder(folder)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeletingFolder(folder)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pasta</DialogTitle>
            <DialogDescription>
              Modifique as informações da pasta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da Pasta</Label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Nome da pasta"
              />
            </div>
            
            <div>
              <Label>Ícone</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {icons.map((icon) => (
                  <Button
                    key={icon}
                    variant={folderIcon === icon ? "default" : "outline"}
                    className="text-2xl h-12"
                    onClick={() => setFolderIcon(icon)}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Cor</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {colors.map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className="h-12"
                    style={{ 
                      backgroundColor: folderColor === color ? color : "transparent",
                      borderColor: color 
                    }}
                    onClick={() => setFolderColor(color)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Tipos de Conteúdo</Label>
              <div className="space-y-2 mt-2">
                {["notes", "flows", "mindmaps", "diary"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${type}`}
                      checked={contentTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setContentTypes([...contentTypes, type]);
                        } else {
                          setContentTypes(contentTypes.filter((t) => t !== type));
                        }
                      }}
                    />
                    <label htmlFor={`edit-${type}`} className="text-sm capitalize">
                      {type === "notes" ? "Notas" :
                       type === "flows" ? "Fluxos Visuais" :
                       type === "mindmaps" ? "Mapas Mentais" :
                       "Diário"}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEditFolder} className="flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setEditingFolder(null)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFolder} onOpenChange={() => setDeletingFolder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pasta "{deletingFolder?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              O que deseja fazer com o conteúdo desta pasta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <Button
              variant={deleteAction === "move" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setDeleteAction("move")}
            >
              📁 Mover conteúdo para "Sem Pasta"
            </Button>
            <Button
              variant={deleteAction === "delete" ? "default" : "outline"}
              className="w-full justify-start text-destructive"
              onClick={() => setDeleteAction("delete")}
            >
              🗑️ Excluir pasta e todo o conteúdo
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive">
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
