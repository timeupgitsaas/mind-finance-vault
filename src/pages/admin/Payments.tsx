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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  plan_type: string | null;
  created_at: string;
  paid_at: string | null;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const totalApproved = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalFailed = payments
    .filter(p => p.status === 'failed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-[#10b981] text-white">Aprovado ✅</Badge>;
      case 'failed':
        return <Badge className="bg-[#ef4444] text-white">Falhou ❌</Badge>;
      case 'pending':
        return <Badge className="bg-[#f59e0b] text-white">Pendente ⏳</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Gerenciar Pagamentos</h1>
          <p className="text-muted-foreground">
            Total de pagamentos: {payments.length}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-sm text-[#f1f5f9]">Total Aprovado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#10b981]">
                {formatCurrency(totalApproved)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-sm text-[#f1f5f9]">Total Falhado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[#ef4444]">
                {formatCurrency(totalFailed)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-sm text-[#f1f5f9]">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {payments.length > 0 
                  ? ((payments.filter(p => p.status === 'success').length / payments.length) * 100).toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
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
                  <TableHead className="text-[#f1f5f9]">Data</TableHead>
                  <TableHead className="text-[#f1f5f9]">Valor</TableHead>
                  <TableHead className="text-[#f1f5f9]">Plano</TableHead>
                  <TableHead className="text-[#f1f5f9]">Método</TableHead>
                  <TableHead className="text-[#f1f5f9]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum pagamento registrado
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow 
                      key={payment.id} 
                      className="border-[#334155] hover:bg-[#0f172a]"
                    >
                      <TableCell className="text-[#f1f5f9]">
                        {formatDate(payment.created_at)}
                      </TableCell>
                      <TableCell className="text-[#f1f5f9] font-semibold">
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell className="text-[#f1f5f9]">
                        {payment.plan_type?.toUpperCase() || '-'}
                      </TableCell>
                      <TableCell className="text-[#f1f5f9]">
                        {payment.payment_method || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
