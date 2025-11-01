import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Admin {
  id: string;
  user_id: string;
  role: string;
  granted_at: string;
  email?: string;
}

export default function AdminSettings() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .in('role', ['admin', 'superadmin']);

      if (error) throw error;

      // Fetch emails for each admin
      const adminsWithEmails: Admin[] = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(admin.user_id);
          return { ...admin, email: user?.email || undefined };
        })
      );

      setAdmins(adminsWithEmails);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  }

  async function handleAddAdmin() {
    if (!newAdminEmail) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get user by email
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const targetUser = users?.find((u: any) => u.email === newAdminEmail);

      if (!targetUser) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado com este email",
          variant: "destructive",
        });
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: targetUser.id,
          role: 'admin',
          granted_by: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Administrador adicionado com sucesso",
      });

      setNewAdminEmail("");
      fetchAdmins();
    } catch (error: any) {
      console.error("Error adding admin:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar administrador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveAdmin(adminId: string, role: string) {
    if (role === 'superadmin') {
      toast({
        title: "Erro",
        description: "Não é possível remover um superadmin",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Administrador removido com sucesso",
      });

      fetchAdmins();
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover administrador",
        variant: "destructive",
      });
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie administradores e configurações do sistema
          </p>
        </div>

        {/* Manage Admins */}
        <Card className="bg-[#1e293b] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9]">Gerenciar Administradores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Admins */}
            <div>
              <h3 className="text-sm font-medium text-[#f1f5f9] mb-3">
                Administradores Atuais
              </h3>
              <div className="bg-[#0f172a] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#334155]">
                      <TableHead className="text-[#f1f5f9]">Email</TableHead>
                      <TableHead className="text-[#f1f5f9]">Tipo</TableHead>
                      <TableHead className="text-[#f1f5f9]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id} className="border-[#334155]">
                        <TableCell className="text-[#f1f5f9]">{admin.email}</TableCell>
                        <TableCell>
                          <Badge className={
                            admin.role === 'superadmin'
                              ? 'bg-[#8b5cf6] text-white'
                              : 'bg-[#3b82f6] text-white'
                          }>
                            {admin.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {admin.role !== 'superadmin' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveAdmin(admin.id, admin.role)}
                              className="text-[#ef4444] hover:bg-[#ef4444]/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Add New Admin */}
            <div className="pt-4 border-t border-[#334155]">
              <h3 className="text-sm font-medium text-[#f1f5f9] mb-3">
                Adicionar Novo Administrador
              </h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="admin-email" className="text-[#f1f5f9]">
                    Email do Usuário
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="usuario@email.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="bg-[#0f172a] border-[#334155] text-[#f1f5f9]"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddAdmin}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
