import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Wallet,
  FileText,
  Network,
  Plus,
  Download,
  Brain,
  Moon,
  Sun,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        <CommandGroup heading="Navegação">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/finance"))}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>Finanças</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/notes"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Notas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/mindmap"))}>
            <Network className="mr-2 h-4 w-4" />
            <span>Mapa Mental</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/diary"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Diário</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/statistics"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Estatísticas</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={() => runCommand(() => navigate("/finance?action=new"))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Nova Transação</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/notes?action=new"))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Nova Nota</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log("Export"))}>
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar Dados</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="IA e Insights">
          <CommandItem onSelect={() => runCommand(() => navigate("/?ai=chat"))}>
            <Brain className="mr-2 h-4 w-4" />
            <span>Chat com IA</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/?ai=insights"))}>
            <Brain className="mr-2 h-4 w-4" />
            <span>Gerar Insights</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Aparência">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Modo Claro</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Modo Escuro</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Sistema</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
