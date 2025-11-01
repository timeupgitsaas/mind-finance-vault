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
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      
      // Fetch users from auth.users via admin API
      const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      setUsers(authUsers as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
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
                  <TableHead className="text-[#f1f5f9]">Data de Cadastro</TableHead>
                  <TableHead className="text-[#f1f5f9]">Último Acesso</TableHead>
                  <TableHead className="text-[#f1f5f9]">Status</TableHead>
                  <TableHead className="text-[#f1f5f9]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-[#334155] hover:bg-[#0f172a]"
                  >
                    <TableCell className="text-[#f1f5f9]">{user.email}</TableCell>
                    <TableCell className="text-[#f1f5f9]">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-[#f1f5f9]">
                      {formatDate(user.last_sign_in_at)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className="bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20"
                      >
                        Ativo
                      </Badge>
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
                ))}
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
        />
      )}
    </AdminLayout>
  );
}
