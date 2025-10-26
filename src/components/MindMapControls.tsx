import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

interface MindMapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
}

export const MindMapControls = ({ zoom, onZoomIn, onZoomOut, onReset, onFit }: MindMapControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg z-10">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        title="Diminuir Zoom (Ctrl + Scroll)"
        className="h-8 w-8"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <div className="px-3 py-1 text-sm font-medium min-w-[60px] text-center bg-secondary rounded">
        {Math.round(zoom * 100)}%
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        title="Aumentar Zoom (Ctrl + Scroll)"
        className="h-8 w-8"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-6 bg-border" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onFit}
        title="Ajustar à Tela"
        className="h-8 w-8"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        title="Reset (100%)"
        className="h-8 w-8"
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
