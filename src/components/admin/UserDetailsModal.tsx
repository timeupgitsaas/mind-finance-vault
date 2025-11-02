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
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  HardDrive, 
  FileText, 
  DollarSign, 
  Zap,
  Database,
  TrendingUp
} from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  plan_type?: string;
}

interface UserDetailsModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onPlanChanged?: () => void;
}

export function UserDetailsModal({ user, open, onClose, onPlanChanged }: UserDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [changingPlan, setChangingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchUserData();
      fetchUsageData();
      setSelectedPlan(user.plan_type || 'free');
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

  async function fetchUsageData() {
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-usage', {
        body: { userId: user.id }
      });

      if (error) throw error;
      
      setUsageData(data.usage);
    } catch (error) {
      console.error("Error fetching usage data:", error);
    }
  }

  async function handleChangePlan() {
    if (!selectedPlan || selectedPlan === user.plan_type) {
      return;
    }

    try {
      setChangingPlan(true);

      const { data, error } = await supabase.functions.invoke('admin-change-plan', {
        body: {
          targetUserId: user.id,
          newPlan: selectedPlan
        }
      });

      if (error) throw error;

      toast({
        title: "Plano alterado com sucesso",
        description: `Plano do usuário alterado para ${selectedPlan.toUpperCase()}`,
      });

      // Refresh data
      await fetchUserData();
      if (onPlanChanged) {
        onPlanChanged();
      }
    } catch (error: any) {
      console.error("Error changing plan:", error);
      toast({
        title: "Erro ao alterar plano",
        description: error.message || "Ocorreu um erro ao alterar o plano",
        variant: "destructive",
      });
    } finally {
      setChangingPlan(false);
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
              <TabsTrigger value="cost" className="data-[state=active]:bg-primary">
                Custo
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
              <div className="space-y-4">
                {/* Change Plan Section */}
                <div className="p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                  <h3 className="text-sm font-medium text-[#f1f5f9] mb-3">Alterar Plano</h3>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Selecione o novo plano
                      </label>
                      <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                        <SelectTrigger className="bg-[#1e293b] border-[#334155] text-[#f1f5f9]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-[#334155]">
                          <SelectItem value="free" className="text-[#f1f5f9]">
                            FREE - Gratuito
                          </SelectItem>
                          <SelectItem value="basic" className="text-[#f1f5f9]">
                            BASIC - R$ 19,90/mês
                          </SelectItem>
                          <SelectItem value="pro" className="text-[#f1f5f9]">
                            PRO - R$ 49,90/mês
                          </SelectItem>
                          <SelectItem value="enterprise" className="text-[#f1f5f9]">
                            ENTERPRISE - R$ 99,90/mês
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleChangePlan}
                      disabled={changingPlan || selectedPlan === user.plan_type}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {changingPlan ? 'Alterando...' : 'Alterar Plano'}
                    </Button>
                  </div>
                </div>

                {/* Current Subscription Info */}
                {userData?.subscription ? (
                  <div className="space-y-3 p-4 bg-[#0f172a] rounded-lg">
                    <div>
                      <label className="text-sm text-muted-foreground">Plano Atual</label>
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
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4 mt-4">
              <div className="space-y-4">
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

                {usageData && (
                  <div className="space-y-3 p-4 bg-[#0f172a] rounded-lg">
                    <h3 className="text-sm font-medium text-[#f1f5f9] mb-2">
                      Armazenamento
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-sm font-medium text-[#f1f5f9]">
                          {usageData.storage.totalMB} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Notas</span>
                        <span className="text-xs text-[#f1f5f9]">
                          {usageData.storage.breakdown.notes} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Diário</span>
                        <span className="text-xs text-[#f1f5f9]">
                          {usageData.storage.breakdown.diary} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">IA</span>
                        <span className="text-xs text-[#f1f5f9]">
                          {usageData.storage.breakdown.aiConversations} MB
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cost" className="space-y-4 mt-4">
              {usageData ? (
                <div className="space-y-4">
                  {/* Total Cost Card */}
                  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-[#f1f5f9] flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Custo Total Estimado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-primary">
                        ${usageData.cost.total.toFixed(4)} USD/mês
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Baseado no uso atual
                      </p>
                    </CardContent>
                  </Card>

                  {/* Cost Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-[#0f172a] border-[#334155]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-[#f1f5f9] flex items-center gap-2">
                          <HardDrive className="w-4 h-4" />
                          Armazenamento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-[#3b82f6]">
                          ${usageData.cost.storage.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {usageData.storage.totalMB} MB usados
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0f172a] border-[#334155]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-[#f1f5f9] flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          IA & Processamento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-[#8b5cf6]">
                          ${usageData.cost.ai.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {usageData.ai.totalMessages} mensagens IA
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0f172a] border-[#334155]">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-[#f1f5f9] flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          Infraestrutura Base
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-[#10b981]">
                          ${usageData.cost.base.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Custo fixo mensal
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Usage Details */}
                  <Card className="bg-[#0f172a] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="text-sm text-[#f1f5f9] flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Detalhes de Uso
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-[#334155]">
                        <span className="text-sm text-muted-foreground">Total de Registros</span>
                        <span className="text-sm font-medium text-[#f1f5f9]">
                          {usageData.records.total}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#334155]">
                        <span className="text-sm text-muted-foreground">Conversas IA</span>
                        <span className="text-sm font-medium text-[#f1f5f9]">
                          {usageData.ai.conversations}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-[#334155]">
                        <span className="text-sm text-muted-foreground">Mensagens IA Total</span>
                        <span className="text-sm font-medium text-[#f1f5f9]">
                          {usageData.ai.totalMessages}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Armazenamento Total</span>
                        <span className="text-sm font-medium text-[#f1f5f9]">
                          {usageData.storage.totalMB} MB
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Efficiency Score */}
                  <Card className="bg-[#0f172a] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="text-sm text-[#f1f5f9] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Análise de Custo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {usageData.cost.total < 1 ? (
                          <span className="text-[#10b981]">✓ Usuário de baixo custo</span>
                        ) : usageData.cost.total < 5 ? (
                          <span className="text-[#3b82f6]">→ Usuário de custo moderado</span>
                        ) : (
                          <span className="text-[#f59e0b]">⚠ Usuário de alto custo</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        LTV Estimado: ${(usageData.cost.total * 12 * 1.5).toFixed(2)} USD/ano
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="p-8 bg-[#0f172a] rounded-lg text-center">
                  <p className="text-muted-foreground">Carregando dados de custo...</p>
                </div>
              )}
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
