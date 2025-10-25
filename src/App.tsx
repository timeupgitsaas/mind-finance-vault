import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Finance from "./pages/Finance";
import Notes from "./pages/Notes";
import MindMap from "./pages/MindMap";
import Statistics from "./pages/Statistics";
import Diary from "./pages/Diary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <KeyboardShortcuts />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/mindmap" element={<MindMap />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/diary" element={<Diary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
