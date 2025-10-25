import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, FolderOpen, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ObsidianImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [result, setResult] = useState<{ notes: number; folders: number; links: number } | null>(null);
  const [options, setOptions] = useState({
    preserveFolders: true,
    convertLinks: true,
  });
  const { toast } = useToast();

  const parseMarkdown = (content: string, filename: string) => {
    // Extrair frontmatter YAML
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    let title = filename.replace(".md", "");
    let tags: string[] = [];
    let body = content;

    if (match) {
      const frontmatter = match[1];
      body = match[2];

      // Extrair título do frontmatter
      const titleMatch = frontmatter.match(/title:\s*(.+)/);
      if (titleMatch) title = titleMatch[1].replace(/["']/g, "");

      // Extrair tags do frontmatter
      const tagsMatch = frontmatter.match(/tags:\s*\[(.+)\]/);
      if (tagsMatch) {
        tags = tagsMatch[1].split(",").map((t) => t.trim().replace(/["']/g, ""));
      }
    }

    // Extrair tags do conteúdo (#tag)
    const contentTags = body.match(/#[\w-]+/g);
    if (contentTags) {
      tags = [...new Set([...tags, ...contentTags.map((t) => t.slice(1))])];
    }

    return { title, content: body, tags };
  };

  const convertObsidianLinks = (content: string, notesMap: Map<string, string>) => {
    // Converter [[nota]] e [[nota|texto]] para links internos
    return content.replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (match, noteName, _, displayText) => {
      const noteId = notesMap.get(noteName);
      if (noteId) {
        return `[${displayText || noteName}](#/notes?id=${noteId})`;
      }
      return displayText || noteName;
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para importar notas.",
        variant: "destructive",
      });
      setIsImporting(false);
      return;
    }

    const filesArray = Array.from(files);
    const mdFiles = filesArray.filter((f) => f.name.endsWith(".md"));
    const notesMap = new Map<string, string>();
    let notesCreated = 0;
    let foldersCreated = 0;
    let linksConverted = 0;

    try {
      // Primeira passagem: criar todas as notas
      for (let i = 0; i < mdFiles.length; i++) {
        const file = mdFiles[i];
        setCurrentFile(file.name);
        setProgress(((i + 1) / mdFiles.length) * 50); // 0-50% para criação

        const content = await file.text();
        const { title, content: body, tags } = parseMarkdown(content, file.name);

        // Criar pasta se necessário (baseado no caminho do arquivo)
        let folderIds: string[] = [];
        if (options.preserveFolders && file.webkitRelativePath) {
          const pathParts = file.webkitRelativePath.split("/");
          if (pathParts.length > 1) {
            const folderName = pathParts[pathParts.length - 2];
            
            // Verificar se pasta já existe
            const { data: existingFolder } = await supabase
              .from("folders")
              .select("id")
              .eq("user_id", user.id)
              .eq("name", folderName)
              .single();

            if (existingFolder) {
              folderIds = [existingFolder.id];
            } else {
              // Criar pasta
              const { data: newFolder } = await supabase
                .from("folders")
                .insert({
                  user_id: user.id,
                  name: folderName,
                  icon: "📁",
                  content_types: ["notes"],
                })
                .select()
                .single();

              if (newFolder) {
                folderIds = [newFolder.id];
                foldersCreated++;
              }
            }
          }
        }

        // Criar nota
        const { data: newNote } = await supabase
          .from("notes")
          .insert({
            user_id: user.id,
            title,
            content: body,
            tags,
            folder_ids: folderIds,
          })
          .select()
          .single();

        if (newNote) {
          notesMap.set(title, newNote.id);
          notesCreated++;
        }
      }

      // Segunda passagem: converter links
      if (options.convertLinks) {
        let linkIndex = 0;
        for (const [title, noteId] of notesMap.entries()) {
          linkIndex++;
          setProgress(50 + ((linkIndex / notesMap.size) * 50)); // 50-100% para conversão de links

          const { data: note } = await supabase
            .from("notes")
            .select("content")
            .eq("id", noteId)
            .single();

          if (note) {
            const originalContent = note.content;
            const convertedContent = convertObsidianLinks(originalContent, notesMap);

            if (originalContent !== convertedContent) {
              await supabase
                .from("notes")
                .update({ content: convertedContent })
                .eq("id", noteId);

              const linksInNote = (originalContent.match(/\[\[/g) || []).length;
              linksConverted += linksInNote;
            }
          }
        }
      }

      setResult({ notes: notesCreated, folders: foldersCreated, links: linksConverted });
      setProgress(100);

      toast({
        title: "✅ Importação Concluída!",
        description: `${notesCreated} notas importadas com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao importar:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao importar suas notas.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setCurrentFile("");
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          📥 Importar do Obsidian
        </CardTitle>
        <CardDescription>
          Selecione seus arquivos .md ou uma pasta inteira do vault do Obsidian
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Opções */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="preserveFolders"
              checked={options.preserveFolders}
              onCheckedChange={(checked) =>
                setOptions({ ...options, preserveFolders: !!checked })
              }
            />
            <label htmlFor="preserveFolders" className="text-sm cursor-pointer">
              ☑️ Preservar estrutura de pastas
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="convertLinks"
              checked={options.convertLinks}
              onCheckedChange={(checked) =>
                setOptions({ ...options, convertLinks: !!checked })
              }
            />
            <label htmlFor="convertLinks" className="text-sm cursor-pointer">
              ☑️ Converter links internos [[nota]]
            </label>
          </div>
        </div>

        {/* Botão de seleção */}
        {!isImporting && !result && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Selecione seus arquivos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha arquivos .md ou uma pasta inteira
            </p>
            <Button asChild>
              <label className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Selecionar Arquivos
                <input
                  type="file"
                  multiple
                  accept=".md"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </Button>
          </div>
        )}

        {/* Progresso */}
        {isImporting && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Importando...</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            {currentFile && (
              <p className="text-xs text-muted-foreground">Processando: {currentFile}</p>
            )}
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle className="w-5 h-5" />
              ✅ Importação Concluída!
            </div>
            <div className="space-y-1 text-sm">
              <p>• {result.notes} notas importadas</p>
              <p>• {result.folders} pastas criadas</p>
              <p>• {result.links} links convertidos</p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => {
                setResult(null);
                setProgress(0);
              }}
            >
              Importar Mais
            </Button>
          </div>
        )}

        {/* Dicas */}
        <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
          <h4 className="font-semibold">💡 Dicas:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Use "Selecionar Arquivos" e marque a opção "Folder" para importar um vault inteiro</li>
            <li>Links [[nota]] serão convertidos automaticamente</li>
            <li>Tags #tag e frontmatter YAML serão preservados</li>
            <li>A estrutura de pastas será mantida se a opção estiver marcada</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
