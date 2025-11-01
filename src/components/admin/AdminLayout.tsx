import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  LogOut,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "Usuários" },
    { path: "/admin/payments", icon: CreditCard, label: "Pagamentos" },
    { path: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
    { path: "/admin/settings", icon: Settings, label: "Configurações" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      description: "Sessão encerrada com sucesso",
    });
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1e293b] border-r border-[#334155] flex flex-col">
        <div className="p-6 border-b border-[#334155]">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Time Up Flow</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-[#334155] text-[#f1f5f9]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#334155]">
          <Button
            variant="ghost"
            className="w-full justify-start text-[#f1f5f9] hover:bg-[#334155]"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair do Admin
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
