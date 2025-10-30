import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Upload, FileText, FileJson, File } from "lucide-react";
import { useImportExport } from "@/hooks/useImportExport";
import { Progress } from "@/components/ui/progress";

interface ImportExportButtonsProps {
  module: "notes" | "flows" | "diary" | "all";
}

export const ImportExportButtons = ({ module }: ImportExportButtonsProps) => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"json" | "md">("json");
  const [importOptions, setImportOptions] = useState({
    preserveFolders: true,
    convertLinks: true,
    handleDuplicates: "rename" as "skip" | "rename" | "overwrite",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportData, importMarkdown, importJSON, importing, exporting } = useImportExport();

  const handleExport = () => {
    exportData(module, exportFormat);
    setIsExportOpen(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const firstFile = files[0];
    if (firstFile.name.endsWith(".json")) {
      await importJSON(firstFile);
    } else if (firstFile.name.endsWith(".md")) {
      await importMarkdown(files, importOptions);
    }

    setIsImportOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2">
      {/* Export Button */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Dados</DialogTitle>
            <DialogDescription>
              Escolha o formato de exportação dos seus dados
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Formato</Label>
              <RadioGroup value={exportFormat} onValueChange={(v: any) => setExportFormat(v)}>
                <div className="flex items-center space-x-2 mt-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                    <FileJson className="w-4 h-4" />
                    JSON (Backup completo)
                  </Label>
                </div>
                {(module === "notes" || module === "diary") && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="md" id="md" />
                    <Label htmlFor="md" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="w-4 h-4" />
                      Markdown (Compatível com Obsidian)
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
            {exporting && (
              <div className="space-y-2">
                <Label>Exportando...</Label>
                <Progress value={66} />
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleExport} disabled={exporting} className="flex-1">
                {exporting ? "Exportando..." : "Exportar"}
              </Button>
              <Button variant="outline" onClick={() => setIsExportOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Button */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Dados</DialogTitle>
            <DialogDescription>
              Importe arquivos .md (Obsidian) ou .json (backup)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Arraste arquivos ou clique para selecionar
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".md,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                Selecionar Arquivos
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Opções de Importação</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserve-folders"
                    checked={importOptions.preserveFolders}
                    onCheckedChange={(checked) =>
                      setImportOptions({ ...importOptions, preserveFolders: !!checked })
                    }
                  />
                  <label htmlFor="preserve-folders" className="text-sm">
                    Preservar estrutura de pastas
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="convert-links"
                    checked={importOptions.convertLinks}
                    onCheckedChange={(checked) =>
                      setImportOptions({ ...importOptions, convertLinks: !!checked })
                    }
                  />
                  <label htmlFor="convert-links" className="text-sm">
                    Converter links internos [[nota]]
                  </label>
                </div>
              </div>

              <div>
                <Label>Duplicatas</Label>
                <RadioGroup
                  value={importOptions.handleDuplicates}
                  onValueChange={(v: any) =>
                    setImportOptions({ ...importOptions, handleDuplicates: v })
                  }
                >
                  <div className="flex items-center space-x-2 mt-2">
                    <RadioGroupItem value="rename" id="rename" />
                    <Label htmlFor="rename" className="text-sm cursor-pointer">
                      Renomear (adicionar timestamp)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip" className="text-sm cursor-pointer">
                      Ignorar
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overwrite" id="overwrite" />
                    <Label htmlFor="overwrite" className="text-sm cursor-pointer">
                      Sobrescrever
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {importing && (
              <div className="space-y-2">
                <Label>Importando...</Label>
                <Progress value={45} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
