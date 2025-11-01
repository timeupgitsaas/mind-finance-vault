import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Palette, Minus, Activity } from "lucide-react";

interface MindMapCustomizationProps {
  lineType: "straight" | "curved";
  lineColor: string;
  lineWidth: number;
  onLineTypeChange: (type: "straight" | "curved") => void;
  onLineColorChange: (color: string) => void;
  onLineWidthChange: (width: number) => void;
}

const COLORS = [
  { value: "hsl(var(--primary))", label: "Primária", color: "#8B5CF6" },
  { value: "hsl(var(--accent))", label: "Acento", color: "#EC4899" },
  { value: "hsl(var(--success))", label: "Sucesso", color: "#10B981" },
  { value: "hsl(var(--warning))", label: "Aviso", color: "#F59E0B" },
  { value: "hsl(var(--destructive))", label: "Destrutivo", color: "#EF4444" },
  { value: "hsl(var(--muted-foreground))", label: "Neutro", color: "#6B7280" },
];

export function MindMapCustomization({
  lineType,
  lineColor,
  lineWidth,
  onLineTypeChange,
  onLineColorChange,
  onLineWidthChange,
}: MindMapCustomizationProps) {
  return (
    <Card className="shadow-lg border-primary/10 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Palette className="h-5 w-5 text-accent" />
          🎨 Personalização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tipo de Linha
          </Label>
          <Select value={lineType} onValueChange={onLineTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              <SelectItem value="straight">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4" />
                  Reta
                </div>
              </SelectItem>
              <SelectItem value="curved">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Curva
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Cor das Conexões
          </Label>
          <Select value={lineColor} onValueChange={onLineColorChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {COLORS.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2"
                      style={{ backgroundColor: color.color }}
                    />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Espessura da Linha: {lineWidth}px</Label>
          <Slider
            value={[lineWidth]}
            onValueChange={(value) => onLineWidthChange(value[0])}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}