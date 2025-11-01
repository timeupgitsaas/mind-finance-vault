import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Finance from "./pages/Finance";
import Notes from "./pages/Notes";
import MindMap from "./pages/MindMap";
import Statistics from "./pages/Statistics";
import Diary from "./pages/Diary";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminPayments from "./pages/admin/Payments";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/AdminSettings";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <KeyboardShortcuts />
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
              <Route path="/mindmap" element={<ProtectedRoute><MindMap /></ProtectedRoute>} />
              <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
              <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
