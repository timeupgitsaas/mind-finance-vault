import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight, Calendar, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { z } from "zod";
import { CategoryManager } from "@/components/CategoryManager";
import { RecurringTransactions } from "@/components/RecurringTransactions";

// Validation schema
const transactionSchema = z.object({
  title: z.string().min(1, "Título não pode estar vazio").max(100, "Título muito longo (máx 100 caracteres)").trim(),
  amount: z.number().positive("Valor deve ser positivo").finite("Valor inválido").max(1000000000, "Valor muito alto"),
  type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Tipo inválido" }) }),
  date: z.string().min(1, "Data não pode estar vazia"),
});

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category_id?: string;
  categories?: { name: string; color: string };
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

const Finance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Date filter state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [currentMonth, currentYear]);

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) setCategories(data as Category[]);
  };

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Filter by selected month and year
    const startDate = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0];
    const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        categories(name, color)
      `)
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar transações",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTransactions((data || []) as Transaction[]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const parsedAmount = parseFloat(amount);
      
      // Validate input
      const validated = transactionSchema.parse({
        title,
        amount: parsedAmount,
        type,
        date,
      });

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        title: validated.title,
        amount: validated.amount,
        type: validated.type,
        date: validated.date,
        category_id: categoryId || null,
      });

      if (error) {
        toast({
          title: "Erro ao criar transação",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Transação criada!",
          description: "Sua transação foi registrada com sucesso.",
        });
        setTitle("");
        setAmount("");
        setCategoryId("");
        setShowForm(false);
        fetchTransactions();
        fetchCategories();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (isNaN(parseFloat(amount))) {
        toast({
          title: "Erro de validação",
          description: "Valor inválido",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao criar transação",
          description: "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      }
    }
  };

  // Memoized calculations for performance
  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return { 
      income: Math.round(income * 100) / 100, 
      expense: Math.round(expense * 100) / 100, 
      balance: Math.round((income - expense) * 100) / 100 
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    return transactions.slice(0, 10).reverse().map((t) => ({
      name: t.title.length > 15 ? t.title.substring(0, 15) + "..." : t.title,
      Valor: Math.round(Number(t.amount) * 100) / 100,
      fill: t.type === "income" ? "hsl(var(--success))" : "hsl(var(--destructive))",
    }));
  }, [transactions]);

  const categoryByExpense = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === "expense" && t.categories);
    const grouped = expenseTransactions.reduce((acc, t) => {
      const catName = t.categories?.name || "Sem categoria";
      const catColor = t.categories?.color || "#8B5CF6";
      if (!acc[catName]) {
        acc[catName] = { value: 0, color: catColor };
      }
      acc[catName].value += Number(t.amount);
      return acc;
    }, {} as Record<string, { value: number; color: string }>);

    return Object.entries(grouped).map(([name, data]) => ({
      name,
      value: Math.round(data.value * 100) / 100,
      color: data.color,
    }));
  }, [transactions]);

  const pieData = useMemo(() => [
    { name: "Receitas", value: totals.income },
    { name: "Despesas", value: totals.expense },
  ], [totals]);

  const COLORS = {
    income: "hsl(var(--success))",
    expense: "hsl(var(--destructive))",
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Transação excluída",
      });
      fetchTransactions();
    }
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const availableCategories = categories.filter(c => c.type === type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Finanças</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gerencie suas receitas e despesas</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-11 w-11">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border rounded-lg bg-card flex-1 sm:min-w-[200px] justify-center">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm sm:text-base">
                  {monthNames[currentMonth]} {currentYear}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-11 w-11">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 h-11 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span className="sm:inline">Nova Transação</span>
            </Button>
          </div>
        </div>

          <Card className="shadow-lg border-primary/10 bg-gradient-card">
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
              <CardDescription>Adicione uma nova receita ou despesa</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Compras do mês"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={type} onValueChange={(value: "income" | "expense") => setType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria (opcional)</Label>
                    <Select value={categoryId || undefined} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sem categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Salvar</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-all border-success/10 bg-gradient-card group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Receitas do Mês</CardTitle>
              <div className="p-2 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-success">
                R$ {totals.income.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all border-destructive/10 bg-gradient-card group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Despesas do Mês</CardTitle>
              <div className="p-2 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-destructive">
                R$ {totals.expense.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all border-primary/10 bg-gradient-card group sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Saldo do Mês</CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl sm:text-3xl font-bold ${totals.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                R$ {totals.balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="transactions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                {loading ? (
                  <Card className="shadow-lg">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Carregando...
                    </CardContent>
                  </Card>
                ) : transactions.length === 0 ? (
                  <Card className="shadow-lg">
                    <CardContent className="py-8 text-center text-sm sm:text-base text-muted-foreground">
                      Nenhuma transação neste mês. Crie sua primeira transação!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full px-4 sm:px-0 space-y-4">
                      {transactions.map((transaction) => (
                        <Card key={transaction.id} className="shadow-md hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: transaction.categories?.color || "hsl(var(--border))" }}>
                          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm sm:text-base truncate">{transaction.title}</h3>
                                {transaction.categories && (
                                  <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap" style={{ 
                                    backgroundColor: `${transaction.categories.color}20`,
                                    color: transaction.categories.color 
                                  }}>
                                    {transaction.categories.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString("pt-BR", { 
                                  day: '2-digit', 
                                  month: 'long' 
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 justify-between sm:justify-end">
                              <div className={`text-lg sm:text-xl font-bold ${
                                transaction.type === "income" ? "text-success" : "text-destructive"
                              }`}>
                                {transaction.type === "income" ? "+" : "-"} R$ {Number(transaction.amount).toFixed(2)}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteTransaction(transaction.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="charts">
                <div className="grid grid-cols-1 gap-6">
                  <Card className="shadow-lg border-primary/10 bg-gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Últimas Transações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis 
                            dataKey="name" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                          />
                          <Bar dataKey="Valor" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {categoryByExpense.length > 0 && (
                    <Card className="shadow-lg border-accent/10 bg-gradient-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingDown className="w-5 h-5 text-accent" />
                          Despesas por Categoria
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={categoryByExpense}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryByExpense.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <CategoryManager />
            <RecurringTransactions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
