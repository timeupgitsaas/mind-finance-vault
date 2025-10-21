import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoogleDriveConnect } from "@/components/GoogleDriveConnect";
import { FinancialGoals } from "@/components/FinancialGoals";
import { RecurringTransactions } from "@/components/RecurringTransactions";
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
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto p-6 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está um resumo do seu sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {totals.income.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimas {transactions.filter(t => t.type === "income").length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {totals.expense.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Últimas {transactions.filter(t => t.type === "expense").length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {totals.balance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Balanço atual
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GoogleDriveConnect />
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notas Recentes
              </CardTitle>
              <CardDescription>Suas últimas anotações</CardDescription>
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

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
              <CardDescription>Navegue para suas funcionalidades</CardDescription>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FinancialGoals />
          <RecurringTransactions />
        </div>
      </div>
    </div>
  );
};

export default Index;
