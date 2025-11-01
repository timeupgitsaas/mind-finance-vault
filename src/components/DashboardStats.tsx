import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Brain, Flame, Trophy, FileText, Network, TrendingUp } from "lucide-react";

export function DashboardStats() {
  const [stats, setStats] = useState<any>({
    totalTime: 0,
    totalIdeas: 0,
    currentStreak: 0,
    timeByModule: [],
    evolutionData: [],
    writingStats: { words: 0, notes: 0 },
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data: statsData } = await supabase
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (statsData) {
      const totalTime = statsData.reduce((sum, s) => sum + s.time_spent_minutes, 0);
      
      const timeByModule = Object.entries(
        statsData.reduce((acc: any, s) => {
          const moduleName = s.module === "notes" ? "Notas" : 
                           s.module === "flows" ? "Fluxos" :
                           s.module === "mindmap" ? "Mapa" :
                           s.module === "diary" ? "Diário" :
                           s.module === "finance" ? "Finanças" : s.module;
          acc[moduleName] = (acc[moduleName] || 0) + s.time_spent_minutes;
          return acc;
        }, {})
      ).map(([module, minutes]) => ({
        name: module,
        minutos: minutes,
      })).slice(0, 5);

      const totalIdeas = statsData.reduce((sum, s) => sum + s.items_created, 0);

      const last7Days = statsData.slice(-7);
      const evolutionData = last7Days.reduce((acc: any[], stat) => {
        const existing = acc.find((d) => d.date === stat.date);
        if (existing) {
          existing.ideias += stat.items_created;
        } else {
          acc.push({ 
            date: new Date(stat.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            ideias: stat.items_created 
          });
        }
        return acc;
      }, []);

      const dates = [...new Set(statsData.map((s) => s.date))].sort();
      let currentStreak = 0;
      let streak = 0;

      for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
          streak = 1;
        } else {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          streak = diffDays === 1 ? streak + 1 : 1;
        }
      }

      if (dates.length > 0) {
        const lastDate = new Date(dates[dates.length - 1]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        currentStreak = diffDays <= 1 ? streak : 0;
      }

      const writingStats = {
        words: statsData.reduce((sum, s) => sum + s.words_written, 0),
        notes: statsData.filter((s) => s.module === "notes").reduce((sum, s) => sum + s.items_created, 0),
      };

      setStats({
        totalTime,
        totalIdeas,
        currentStreak,
        timeByModule,
        evolutionData,
        writingStats,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg hover:shadow-xl transition-all border-primary/10 bg-gradient-card group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Uso</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Clock className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all border-accent/10 bg-gradient-card group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ideias Criadas</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Brain className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.totalIdeas}</div>
            <p className="text-xs text-muted-foreground mt-1">Total do mês</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all border-warning/10 bg-gradient-card group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sequência Ativa</CardTitle>
            <div className="p-2 rounded-lg bg-warning/10 group-hover:bg-warning/20 transition-colors">
              <Flame className="w-4 h-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">dias consecutivos</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all border-success/10 bg-gradient-card group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Palavras Escritas</CardTitle>
            <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
              <FileText className="w-4 h-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.writingStats.words.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              em {stats.writingStats.notes} notas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-primary/10 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              Tempo por Módulo (últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.timeByModule}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => `${value}`}
                  formatter={(value: any) => [`${value} min`, 'Tempo']}
                />
                <Bar dataKey="minutos" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-accent/10 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Evolução (últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.evolutionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`${value}`, 'Ideias']}
                />
                <Line 
                  type="monotone" 
                  dataKey="ideias" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
