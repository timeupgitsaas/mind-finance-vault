import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "./ThemeToggle";
import { HelpDialog } from "./HelpDialog";
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  Network, 
  LogOut,
  Sparkles,
  BookOpen,
  BarChart3
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/finance", icon: Wallet, label: "Finanças" },
    { path: "/notes", icon: FileText, label: "Notas" },
    { path: "/mindmap", icon: Network, label: "Mapa Mental" },
    { path: "/diary", icon: BookOpen, label: "Diário" },
    { path: "/statistics", icon: BarChart3, label: "Estatísticas" },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:scale-105 transition-transform">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                Time Up Flow
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Organização Inteligente de Ideias
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <HelpDialog />
            <ThemeToggle />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
