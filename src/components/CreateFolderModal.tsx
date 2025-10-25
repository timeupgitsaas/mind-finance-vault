import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface CreateFolderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderCreated: () => void;
}

const ICONS = ["📁", "📊", "💼", "🏠", "📚", "🎯", "💡", "🎨", "🔬", "🎭"];
const COLORS = [
  { name: "Roxo", value: "#8B5CF6" },
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Amarelo", value: "#F59E0B" },
  { name: "Vermelho", value: "#EF4444" },
  { name: "Rosa", value: "#EC4899" },
];

export const CreateFolderModal = ({ open, onOpenChange, onFolderCreated }: CreateFolderModalProps) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");
  const [contentTypes, setContentTypes] = useState({
    notes: true,
    flows: true,
    mindmaps: true,
    diary: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite um nome para a pasta.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const selectedTypes = Object.entries(contentTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type);

    const { error } = await supabase.from("folders").insert({
      user_id: user.id,
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      content_types: selectedTypes,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Erro ao criar pasta",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Reset form
    setName("");
    setSelectedIcon("📁");
    setSelectedColor("#8B5CF6");
    setContentTypes({ notes: true, flows: true, mindmaps: true, diary: true });

    onFolderCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Pasta</DialogTitle>
          <DialogDescription>
            Organize suas notas, fluxos e ideias em pastas personalizadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome da pasta */}
          <div className="space-y-2">
            <Label>Nome da Pasta</Label>
            <Input
              placeholder="Ex: Trabalho, Estudos, Projetos..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          {/* Seletor de ícone */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map((icon) => (
                <Button
                  key={icon}
                  variant={selectedIcon === icon ? "default" : "outline"}
                  className="text-2xl h-12"
                  onClick={() => setSelectedIcon(icon)}
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>

          {/* Seletor de cor */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-3 gap-2">
              {COLORS.map((color) => (
                <Button
                  key={color.value}
                  variant={selectedColor === color.value ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => setSelectedColor(color.value)}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Tipos de conteúdo */}
          <div className="space-y-2">
            <Label>Tipos de Conteúdo</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notes"
                  checked={contentTypes.notes}
                  onCheckedChange={(checked) =>
                    setContentTypes({ ...contentTypes, notes: !!checked })
                  }
                />
                <label htmlFor="notes" className="text-sm cursor-pointer">
                  ☑️ Notas
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flows"
                  checked={contentTypes.flows}
                  onCheckedChange={(checked) =>
                    setContentTypes({ ...contentTypes, flows: !!checked })
                  }
                />
                <label htmlFor="flows" className="text-sm cursor-pointer">
                  ☑️ Fluxos Visuais
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mindmaps"
                  checked={contentTypes.mindmaps}
                  onCheckedChange={(checked) =>
                    setContentTypes({ ...contentTypes, mindmaps: !!checked })
                  }
                />
                <label htmlFor="mindmaps" className="text-sm cursor-pointer">
                  ☑️ Mapas Mentais
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="diary"
                  checked={contentTypes.diary}
                  onCheckedChange={(checked) =>
                    setContentTypes({ ...contentTypes, diary: !!checked })
                  }
                />
                <label htmlFor="diary" className="text-sm cursor-pointer">
                  ☑️ Diário
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreate} disabled={isLoading} className="flex-1">
              {isLoading ? "Criando..." : "Criar Pasta"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
