import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "./ThemeToggle";
import { HelpDialog } from "./HelpDialog";
import { LanguageSelector } from "./LanguageSelector";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  Network, 
  LogOut,
  Sparkles,
  BookOpen,
  BarChart3,
  Menu,
  Settings as SettingsIcon
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { path: "/settings", icon: SettingsIcon, label: "Configurações" },
  ];

  return (
    <nav className="border-b border-border/50 bg-gradient-card backdrop-blur-xl sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl group hover:scale-105 transition-all">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary group-hover:shadow-lg transition-all">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                Time Up Flow
              </span>
              <span className="text-xs text-muted-foreground -mt-1">
                Sua plataforma de produtividade
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 transition-all ${isActive ? 'shadow-primary' : 'hover:bg-accent/10'}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}

            <HelpDialog />
            <LanguageSelector />
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

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                        Time Up Flow
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Menu
                      </span>
                    </div>
                  </div>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start gap-3 h-12 text-base ${isActive ? 'shadow-primary' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}

                  <div className="mt-4 pt-4 border-t space-y-2">
                    <HelpDialog />
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-3 h-12 text-base text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sair</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
