import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N - Nova nota
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        navigate("/notes?action=new");
        toast({
          title: "Nova Nota",
          description: "Criando nova nota...",
        });
      }

      // Ctrl/Cmd + M - Mapa mental
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        navigate("/mindmap");
        toast({
          title: "Mapa Mental",
          description: "Abrindo mapa mental...",
        });
      }

      // Ctrl/Cmd + F - Finanças
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        navigate("/finance");
        toast({
          title: "Finanças",
          description: "Abrindo módulo financeiro...",
        });
      }

      // Ctrl/Cmd + H - Dashboard (Home)
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        navigate("/");
        toast({
          title: "Dashboard",
          description: "Retornando ao dashboard...",
        });
      }

      // F1 - Ajuda
      if (e.key === "F1") {
        e.preventDefault();
        toast({
          title: "Ajuda",
          description: "Procure pelo botão de ajuda (?) na interface",
        });
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [navigate, toast]);

  return null;
}
