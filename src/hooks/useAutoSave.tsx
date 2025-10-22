import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAutoSaveProps {
  content: string;
  onSave: () => Promise<void>;
  delay?: number;
}

export function useAutoSave({ content, onSave, delay = 2000 }: UseAutoSaveProps) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousContent = useRef(content);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only save if content actually changed
    if (content !== previousContent.current && content.trim()) {
      timeoutRef.current = setTimeout(async () => {
        try {
          await onSave();
          previousContent.current = content;
          toast({
            title: "Salvo automaticamente",
            description: "Suas alterações foram salvas.",
            duration: 2000,
          });
        } catch (error) {
          console.error("Auto-save error:", error);
        }
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, onSave, delay, toast]);
}
