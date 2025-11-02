import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  plan_type?: string;
  role?: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  async function fetchUsers() {
    try {
      setLoading(true);
      
      // Call the admin edge function to list users
      const { data, error } = await supabase.functions.invoke('admin-list-users');
      
      if (error) throw error;
      
      if (data?.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Fallback: try to fetch from user_preferences
      try {
        const { data: preferences, error: prefError } = await supabase
          .from('user_preferences')
          .select('user_id, created_at');
        
        if (prefError) throw prefError;

        const usersData: User[] = await Promise.all(
          (preferences || []).map(async (pref) => {
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('plan_type')
              .eq('user_id', pref.user_id)
              .single();

            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', pref.user_id)
              .single();

            return {
              id: pref.user_id,
              email: 'user@example.com', // Email não disponível sem admin API
              created_at: pref.created_at,
              last_sign_in_at: null,
              plan_type: subscription?.plan_type || 'free',
              role: roleData?.role || 'user',
            };
          })
        );
        
        setUsers(usersData);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#f1f5f9]">Gerenciar Usuários</h1>
            <p className="text-muted-foreground">
              Total de usuários: {users.length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#1e293b] border-[#334155] text-[#f1f5f9]"
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 bg-[#1e293b]" />
            ))}
          </div>
        ) : (
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#334155] hover:bg-[#0f172a]">
                  <TableHead className="text-[#f1f5f9]">Email</TableHead>
                  <TableHead className="text-[#f1f5f9]">Plano</TableHead>
                  <TableHead className="text-[#f1f5f9]">Tipo</TableHead>
                  <TableHead className="text-[#f1f5f9]">Data de Cadastro</TableHead>
                  <TableHead className="text-[#f1f5f9]">Último Acesso</TableHead>
                  <TableHead className="text-[#f1f5f9]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={6} 
                      className="text-center text-muted-foreground py-8"
                    >
                      {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const getPlanBadge = (plan: string) => {
                      const colors: Record<string, string> = {
                        free: 'bg-[#94a3b8]/10 text-[#94a3b8] border-[#94a3b8]/20',
                        basic: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
                        pro: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20',
                        enterprise: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20',
                      };
                      return colors[plan] || colors.free;
                    };

                    const getRoleBadge = (role: string) => {
                      if (role === 'superadmin') return 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20';
                      if (role === 'admin') return 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20';
                      return 'bg-[#64748b]/10 text-[#64748b] border-[#64748b]/20';
                    };

                    return (
                      <TableRow 
                        key={user.id} 
                        className="border-[#334155] hover:bg-[#0f172a]"
                      >
                        <TableCell className="text-[#f1f5f9]">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={getPlanBadge(user.plan_type || 'free')}
                          >
                            {(user.plan_type || 'free').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={getRoleBadge(user.role || 'user')}
                          >
                            {(user.role || 'user').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#f1f5f9]">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="text-[#f1f5f9]">
                          {formatDate(user.last_sign_in_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
                            className="text-[#f1f5f9] hover:bg-[#334155]"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          onPlanChanged={() => setRefreshKey(k => k + 1)}
        />
      )}
    </AdminLayout>
  );
}
