import { AdminLayout } from "@/components/admin/AdminLayout";
import { MetricCard } from "@/components/admin/MetricCard";
import { useAdminStats } from "@/hooks/useAdminStats";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle,
  UserX 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function AdminDashboard() {
  const { stats, loading } = useAdminStats();

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Dashboard Administrativo</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 bg-[#1e293b]" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const planData = [
    { name: 'Free', value: stats.planDistribution.free, color: '#94a3b8' },
    { name: 'Basic', value: stats.planDistribution.basic, color: '#3b82f6' },
    { name: 'Pro', value: stats.planDistribution.pro, color: '#8b5cf6' },
    { name: 'Enterprise', value: stats.planDistribution.enterprise, color: '#10b981' },
  ].filter(plan => plan.value > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral do negócio em tempo real</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="MRR (Receita Mensal)"
            value={`R$ ${stats.mrr.toFixed(2)}`}
            change={stats.mrrChange}
            icon={DollarSign}
            color="text-[#10b981]"
          />
          
          <MetricCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={Users}
            color="text-[#3b82f6]"
            subtitle={`${stats.paidUsers} pagos`}
          />
          
          <MetricCard
            title="Taxa de Conversão"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="text-[#8b5cf6]"
            subtitle="FREE → PRO"
          />
          
          <MetricCard
            title="Pagamentos Este Mês"
            value={stats.paymentsThisMonth}
            icon={CreditCard}
            color="text-[#10b981]"
            subtitle="aprovados"
          />
          
          <MetricCard
            title="Pagamentos Falhados"
            value={stats.failedPayments}
            icon={AlertTriangle}
            color="text-[#f59e0b]"
            subtitle="este mês"
          />
          
          <MetricCard
            title="Churn Rate"
            value={`${stats.churnRate}%`}
            icon={UserX}
            color="text-[#ef4444]"
            subtitle="mensal"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-[#f1f5f9]">Distribuição de Planos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      color: '#f1f5f9'
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-[#f1f5f9]">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg">
                <span className="text-sm text-[#f1f5f9]">Novos usuários (7 dias)</span>
                <span className="font-bold text-primary">{stats.newUsersLast7Days}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg">
                <span className="text-sm text-[#f1f5f9]">Novos usuários (30 dias)</span>
                <span className="font-bold text-primary">{stats.newUsersLast30Days}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg">
                <span className="text-sm text-[#f1f5f9]">Usuários Free</span>
                <span className="font-bold text-[#94a3b8]">{stats.freeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg">
                <span className="text-sm text-[#f1f5f9]">Usuários Pagos</span>
                <span className="font-bold text-[#10b981]">{stats.paidUsers}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
