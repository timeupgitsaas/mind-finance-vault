import { Sparkles } from "lucide-react";

export function AILoader() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}