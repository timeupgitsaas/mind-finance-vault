import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Analytics</h1>
          <p className="text-muted-foreground">
            Análise detalhada de métricas e comportamento
          </p>
        </div>

        <Card className="bg-[#1e293b] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-[#f1f5f9]">Em Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Gráficos avançados de analytics serão implementados em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
