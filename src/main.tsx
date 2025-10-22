import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <KeyboardShortcuts />
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>
);
