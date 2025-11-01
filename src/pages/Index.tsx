import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancialGoals } from "@/components/FinancialGoals";
import { RecurringTransactions } from "@/components/RecurringTransactions";
import { AIInsights } from "@/components/AIInsights";
import { AIChat } from "@/components/AIChat";
import { CommandPalette } from "@/components/CommandPalette";
import { DashboardStats } from "@/components/DashboardStats";
import { 
  Wallet, 
  FileText, 
  Network, 
  TrendingUp, 
  TrendingDown,
  Clock
} from "lucide-react";

interface Transaction {
  amount: number;
  type: "income" | "expense";
}

interface Note {
  id: string;
  title: string;
  updated_at: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    // Fetch recent transactions
    const { data: transactionsData } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    if (transactionsData) {
      setTransactions(transactionsData as Transaction[]);
    }

    // Fetch recent notes
    const { data: notesData } = await supabase
      .from("notes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5);

    if (notesData) {
      setNotes(notesData);
    }
  };

  if (!user) {
    return null;
  }

  const calculateTotals = () => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return { income, expense, balance: income - expense };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <CommandPalette />
      
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="text-center sm:text-left mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Bem-vindo de volta! 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Sua central de produtividade e organização pessoal
          </p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-all border-success/10 bg-gradient-card group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">💰 Receitas</CardTitle>
              <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-success">
                R$ {totals.income.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {transactions.filter(t => t.type === "income").length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all border-destructive/10 bg-gradient-card group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">💸 Despesas</CardTitle>
              <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-destructive">
                R$ {totals.expense.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {transactions.filter(t => t.type === "expense").length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all border-primary/10 bg-gradient-card group sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">💵 Saldo</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl sm:text-3xl font-bold ${totals.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {totals.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Balanço atual
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIInsights />
          <FinancialGoals />
        </div>

        <RecurringTransactions />

        <AIChat />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-lg border-primary/10 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="w-5 h-5 text-accent" />
                📝 Notas Recentes
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Suas últimas anotações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma nota criada ainda
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => navigate("/notes")}
                  >
                    <span className="font-medium truncate">{note.title}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(note.updated_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/10 bg-gradient-card">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">🚀 Acesso Rápido</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Navegue para suas funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="justify-start gap-3 h-auto py-4"
                onClick={() => navigate("/finance")}
              >
                <Wallet className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Finanças</div>
                  <div className="text-xs text-muted-foreground">
                    Gerencie receitas e despesas
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-3 h-auto py-4"
                onClick={() => navigate("/notes")}
              >
                <FileText className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <div className="font-semibold">Notas</div>
                  <div className="text-xs text-muted-foreground">
                    Organize suas ideias
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start gap-3 h-auto py-4"
                onClick={() => navigate("/mindmap")}
              >
                <Network className="w-5 h-5 text-success" />
                <div className="text-left">
                  <div className="font-semibold">Mapa Mental</div>
                  <div className="text-xs text-muted-foreground">
                    Visualize conexões
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Index;
