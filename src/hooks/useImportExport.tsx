import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImportOptions {
  preserveFolders?: boolean;
  convertLinks?: boolean;
  handleDuplicates?: "skip" | "rename" | "overwrite";
}

export const useImportExport = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportData = async (type: "notes" | "flows" | "diary" | "all", format: "json" | "md" | "csv" = "json") => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let data: any = {};

      if (type === "notes" || type === "all") {
        const { data: notes } = await supabase
          .from("notes")
          .select("*")
          .eq("user_id", user.id);
        data.notes = notes;
      }

      if (type === "diary" || type === "all") {
        const { data: diary } = await supabase
          .from("diary_entries")
          .select("*")
          .eq("user_id", user.id);
        data.diary = diary;
      }

      if (type === "all") {
        const { data: folders } = await supabase
          .from("folders")
          .select("*")
          .eq("user_id", user.id);
        data.folders = folders;
      }

      let exportContent: string;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        exportContent = JSON.stringify(data, null, 2);
        filename = `timeupflow-${type}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = "application/json";
      } else if (format === "md" && (type === "notes" || type === "diary")) {
        // Exportar como Markdown (compatível com Obsidian)
        const items = data.notes || data.diary || [];
        exportContent = items.map((item: any) => {
          let md = `# ${item.title}\n\n`;
          if (item.tags && item.tags.length > 0) {
            md += `Tags: ${item.tags.map((t: string) => `#${t}`).join(" ")}\n\n`;
          }
          md += `${item.content}\n\n`;
          md += `---\n`;
          return md;
        }).join("\n");
        filename = `timeupflow-${type}-${new Date().toISOString().split('T')[0]}.md`;
        mimeType = "text/markdown";
      } else {
        exportContent = JSON.stringify(data, null, 2);
        filename = `timeupflow-${type}-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = "application/json";
      }

      const blob = new Blob([exportContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "✅ Exportação concluída!",
        description: `Arquivo ${filename} foi baixado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro durante a exportação.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const importMarkdown = async (files: FileList, options: ImportOptions = {}) => {
    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let imported = 0;
      let skipped = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();

        // Parse frontmatter e conteúdo
        const lines = content.split("\n");
        let title = file.name.replace(".md", "");
        let tags: string[] = [];
        let noteContent = content;

        // Extrair título da primeira linha # se existir
        if (lines[0].startsWith("# ")) {
          title = lines[0].replace("# ", "").trim();
          noteContent = lines.slice(1).join("\n");
        }

        // Extrair tags
        const tagMatch = content.match(/Tags:\s*([^\n]+)/);
        if (tagMatch) {
          tags = tagMatch[1]
            .split(" ")
            .filter((t) => t.startsWith("#"))
            .map((t) => t.replace("#", ""));
        }

        // Converter links [[nota]] se opção ativada
        if (options.convertLinks) {
          // Buscar notas existentes para criar links
          const linkPattern = /\[\[([^\]]+)\]\]/g;
          const matches = noteContent.matchAll(linkPattern);
          for (const match of matches) {
            const linkedTitle = match[1];
            // Manter o formato [[]] - será processado pelo sistema
          }
        }

        // Verificar duplicatas
        const { data: existing } = await supabase
          .from("notes")
          .select("id, title")
          .eq("user_id", user.id)
          .eq("title", title)
          .maybeSingle();

        if (existing) {
          if (options.handleDuplicates === "skip") {
            skipped++;
            continue;
          } else if (options.handleDuplicates === "rename") {
            title = `${title} (${new Date().getTime()})`;
          } else if (options.handleDuplicates === "overwrite") {
            await supabase
              .from("notes")
              .update({ content: noteContent, tags })
              .eq("id", existing.id);
            imported++;
            continue;
          }
        }

        // Criar nova nota
        const { error } = await supabase.from("notes").insert({
          user_id: user.id,
          title,
          content: noteContent.trim(),
          tags,
        });

        if (!error) imported++;
      }

      toast({
        title: "📥 Importação concluída!",
        description: `${imported} arquivos importados${skipped > 0 ? `, ${skipped} ignorados` : ""}.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: "Ocorreu um erro durante a importação.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const importJSON = async (file: File) => {
    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const content = await file.text();
      const data = JSON.parse(content);

      let imported = 0;

      // Importar pastas
      if (data.folders) {
        for (const folder of data.folders) {
          await supabase.from("folders").insert({
            user_id: user.id,
            name: folder.name,
            icon: folder.icon,
            color: folder.color,
            content_types: folder.content_types,
          });
          imported++;
        }
      }

      // Importar notas
      if (data.notes) {
        for (const note of data.notes) {
          await supabase.from("notes").insert({
            user_id: user.id,
            title: note.title,
            content: note.content,
            tags: note.tags,
            folder_ids: note.folder_ids || [],
          });
          imported++;
        }
      }

      // Importar diário
      if (data.diary) {
        for (const entry of data.diary) {
          await supabase.from("diary_entries").insert({
            user_id: user.id,
            title: entry.title,
            content: entry.content,
            mood: entry.mood,
            tags: entry.tags,
            date: entry.date,
            folder_ids: entry.folder_ids || [],
          });
          imported++;
        }
      }

      toast({
        title: "📥 Importação concluída!",
        description: `${imported} itens importados com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: "Arquivo JSON inválido ou erro durante importação.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return {
    exportData,
    importMarkdown,
    importJSON,
    importing,
    exporting,
  };
};
