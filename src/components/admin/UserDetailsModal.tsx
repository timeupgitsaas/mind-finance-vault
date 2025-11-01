import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface UserDetailsModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ user, open, onClose }: UserDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (open && user) {
      fetchUserData();
    }
  }, [open, user]);

  async function fetchUserData() {
    try {
      setLoading(true);

      // Fetch subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch usage stats
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: transactionsCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: diaryCount } = await supabase
        .from('diary_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch sensitive data (admin only)
      const { data: sensitiveData } = await supabase
        .from('user_sensitive_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setUserData({
        subscription,
        payments: payments || [],
        stats: {
          notes: notesCount || 0,
          transactions: transactionsCount || 0,
          diary: diaryCount || 0,
        },
        sensitiveData,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const totalPaid = userData?.payments.reduce(
    (sum: number, p: any) => p.status === 'success' ? sum + Number(p.amount) : sum,
    0
  ) || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#1e293b] border-[#334155] text-[#f1f5f9]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#f1f5f9]">
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 bg-[#0f172a]" />
            <Skeleton className="h-20 bg-[#0f172a]" />
            <Skeleton className="h-20 bg-[#0f172a]" />
          </div>
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="bg-[#0f172a]">
              <TabsTrigger value="info" className="data-[state=active]:bg-primary">
                Info Pessoal
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-primary">
                Assinatura
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-primary">
                Uso
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-primary">
                Pagamentos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-3 p-4 bg-[#0f172a] rounded-lg">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-[#f1f5f9] font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Data de Cadastro</label>
                  <p className="text-[#f1f5f9] font-medium">{formatDate(user.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">ID do Usuário</label>
                  <p className="text-[#f1f5f9] font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4 mt-4">
              {userData?.subscription ? (
                <div className="space-y-3 p-4 bg-[#0f172a] rounded-lg">
                  <div>
                    <label className="text-sm text-muted-foreground">Plano</label>
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      {userData.subscription.plan_type.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <Badge className="ml-2 bg-[#10b981] text-white">
                      {userData.subscription.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Desde</label>
                    <p className="text-[#f1f5f9] font-medium">
                      {formatDate(userData.subscription.started_at)}
                    </p>
                  </div>
                  {userData.subscription.next_billing_date && (
                    <div>
                      <label className="text-sm text-muted-foreground">Próxima Cobrança</label>
                      <p className="text-[#f1f5f9] font-medium">
                        {formatDate(userData.subscription.next_billing_date)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-[#0f172a] rounded-lg text-center text-muted-foreground">
                  Sem assinatura ativa
                </div>
              )}
            </TabsContent>

            <TabsContent value="usage" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[#0f172a] rounded-lg">
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="text-2xl font-bold text-primary">{userData?.stats.notes}</p>
                </div>
                <div className="p-4 bg-[#0f172a] rounded-lg">
                  <p className="text-sm text-muted-foreground">Transações</p>
                  <p className="text-2xl font-bold text-primary">{userData?.stats.transactions}</p>
                </div>
                <div className="p-4 bg-[#0f172a] rounded-lg">
                  <p className="text-sm text-muted-foreground">Diários</p>
                  <p className="text-2xl font-bold text-primary">{userData?.stats.diary}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4 mt-4">
              <div className="p-4 bg-[#0f172a] rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-[#10b981]">{formatCurrency(totalPaid)}</p>
              </div>

              {userData?.payments.length > 0 ? (
                <div className="space-y-2">
                  {userData.payments.map((payment: any) => (
                    <div key={payment.id} className="p-3 bg-[#0f172a] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-[#f1f5f9] font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                      <Badge className={
                        payment.status === 'success' 
                          ? 'bg-[#10b981] text-white'
                          : 'bg-[#ef4444] text-white'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#0f172a] rounded-lg text-center text-muted-foreground">
                  Nenhum pagamento registrado
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
