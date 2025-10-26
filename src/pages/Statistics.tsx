import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Brain, Flame, Trophy, FileText, Network, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import { FolderSidebar } from "@/components/FolderSidebar";

type Period = "month" | "year" | "all";

export default function Statistics() {
  const [period, setPeriod] = useState<Period>("month");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    totalTime: 0,
    totalIdeas: 0,
    currentStreak: 0,
    bestStreak: 0,
    timeByModule: [],
    evolutionData: [],
    writingStats: { characters: 0, words: 0, notes: 0 },
    connectionsStats: { blocks: 0, connections: 0, flows: 0, maps: 0 },
    activityStats: { mostActiveHour: 0, mostActiveDay: "", firstEntry: "" },
  });

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    let startDate = new Date();

    if (period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear() - 1);
    } else {
      startDate = new Date(0); // Início dos tempos
    }

    // Buscar estatísticas
    const { data: statsData } = await supabase
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (statsData) {
      // Calcular tempo total
      const totalTime = statsData.reduce((sum, s) => sum + s.time_spent_minutes, 0);

      // Tempo por módulo
      const timeByModule = Object.entries(
        statsData.reduce((acc: any, s) => {
          acc[s.module] = (acc[s.module] || 0) + s.time_spent_minutes;
          return acc;
        }, {})
      ).map(([module, minutes]) => ({
        name: module,
        minutes,
      }));

      // Total de ideias criadas
      const totalIdeas = statsData.reduce((sum, s) => sum + s.items_created, 0);

      // Estatísticas de escrita
      const writingStats = {
        characters: statsData.reduce((sum, s) => sum + s.characters_written, 0),
        words: statsData.reduce((sum, s) => sum + s.words_written, 0),
        notes: statsData.filter((s) => s.module === "notes").reduce((sum, s) => sum + s.items_created, 0),
      };

      // Estatísticas de conexões
      const connectionsStats = {
        blocks: statsData.reduce((sum, s) => sum + s.items_created, 0),
        connections: statsData.reduce((sum, s) => sum + s.connections_created, 0),
        flows: statsData.filter((s) => s.module === "flows").reduce((sum, s) => sum + s.items_created, 0),
        maps: statsData.filter((s) => s.module === "mindmap").reduce((sum, s) => sum + s.items_created, 0),
      };

      // Dados de evolução (últimos 30 dias)
      const last30Days = statsData.slice(-30);
      const evolutionData = last30Days.reduce((acc: any[], stat) => {
        const existing = acc.find((d) => d.date === stat.date);
        if (existing) {
          existing.ideas += stat.items_created;
        } else {
          acc.push({ date: stat.date, ideas: stat.items_created });
        }
        return acc;
      }, []);

      // Hora mais ativa
      const hourCounts = statsData.reduce((acc: any, s) => {
        if (s.hour_of_day !== null) {
          acc[s.hour_of_day] = (acc[s.hour_of_day] || 0) + 1;
        }
        return acc;
      }, {});
      const mostActiveHour = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 0;

      // Dia mais ativo (da semana)
      const dayCounts = statsData.reduce((acc: any, s) => {
        const day = new Date(s.date).getDay();
        acc[day] = (acc[day] || 0) + s.time_spent_minutes;
        return acc;
      }, {});
      const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
      const mostActiveDayIndex = Object.entries(dayCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 0;
      const mostActiveDay = days[mostActiveDayIndex as number];

      // Primeira entrada
      const firstEntry = statsData[0]?.date || "";

      // Sequência de dias consecutivos
      const dates = [...new Set(statsData.map((s) => s.date))].sort();
      let currentStreak = 0;
      let bestStreak = 0;
      let streak = 0;

      for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
          streak = 1;
        } else {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            streak++;
          } else {
            if (streak > bestStreak) bestStreak = streak;
            streak = 1;
          }
        }
      }

      if (streak > bestStreak) bestStreak = streak;

      // Verificar se a última data é hoje ou ontem
      if (dates.length > 0) {
        const lastDate = new Date(dates[dates.length - 1]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          currentStreak = streak;
        } else {
          currentStreak = 0;
        }
      }

      setStats({
        totalTime,
        totalIdeas,
        currentStreak,
        bestStreak,
        timeByModule,
        evolutionData,
        writingStats,
        connectionsStats,
        activityStats: { mostActiveHour, mostActiveDay, firstEntry },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      <FolderSidebar 
        selectedFolderId={selectedFolderId}
        onFolderSelect={setSelectedFolderId}
        contentType="notes"
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <div className="container mx-auto p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            📊 Minha Jornada
          </h1>
          <p className="text-muted-foreground">Acompanhe seu progresso e evolução</p>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="month">Este Mês</TabsTrigger>
            <TabsTrigger value="year">Este Ano</TabsTrigger>
            <TabsTrigger value="all">Todo Tempo</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Cards de Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">⏱️ Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.floor(stats.totalTime / 30)}min/dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">💡 Ideias Criadas</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIdeas}</div>
            <p className="text-xs text-muted-foreground">Notas, fluxos e mapas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🔥 Sequência Atual</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} dias</div>
            <p className="text-xs text-muted-foreground">Recorde: {stats.bestStreak} dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">🏆 Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Top 10%</div>
            <p className="text-xs text-muted-foreground">Entre todos os usuários</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tempo por Módulo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.timeByModule}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minutes" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução de Ideias (Últimos 30 Dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ideas" stroke="#EC4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ✍️ Escrita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Caracteres:</span>
              <span className="font-bold">{stats.writingStats.characters.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Palavras:</span>
              <span className="font-bold">{stats.writingStats.words.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notas:</span>
              <span className="font-bold">{stats.writingStats.notes}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              🔗 Conexões
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blocos criados:</span>
              <span className="font-bold">{stats.connectionsStats.blocks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conexões:</span>
              <span className="font-bold">{stats.connectionsStats.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fluxos:</span>
              <span className="font-bold">{stats.connectionsStats.flows}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mapas:</span>
              <span className="font-bold">{stats.connectionsStats.maps}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              ⏰ Atividade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora mais ativa:</span>
              <span className="font-bold">{stats.activityStats.mostActiveHour}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dia mais ativo:</span>
              <span className="font-bold">{stats.activityStats.mostActiveDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primeira entrada:</span>
              <span className="font-bold">{stats.activityStats.firstEntry || "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  );
}
