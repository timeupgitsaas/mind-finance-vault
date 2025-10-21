import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Repeat, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  frequency: string;
  start_date: string;
  is_active: boolean;
}

export function RecurringTransactions() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [frequency, setFrequency] = useState("monthly");
  const { toast } = useToast();

  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRecurring(data as RecurringTransaction[]);
    }
  };

  const createRecurring = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("recurring_transactions").insert({
      user_id: user.id,
      title,
      amount: parseFloat(amount),
      type,
      frequency,
      start_date: new Date().toISOString().split('T')[0],
    });

    if (error) {
      toast({
        title: "Erro ao criar recorrência",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recorrência criada!",
        description: "Transação recorrente adicionada",
      });
      setTitle("");
      setAmount("");
      setIsDialogOpen(false);
      fetchRecurring();
    }
  };

  const deleteRecurring = async (id: string) => {
    const { error } = await supabase
      .from("recurring_transactions")
      .delete()
      .eq("id", id);

    if (!error) {
      toast({
        title: "Recorrência removida",
        description: "Transação recorrente excluída",
      });
      fetchRecurring();
    }
  };

  const frequencyLabels: Record<string, string> = {
    daily: "Diária",
    weekly: "Semanal",
    monthly: "Mensal",
    yearly: "Anual",
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5" />
              Despesas Recorrentes
            </CardTitle>
            <CardDescription>Assinaturas e contas fixas</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação Recorrente</DialogTitle>
                <DialogDescription>
                  Configure uma despesa ou receita recorrente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Netflix"
                  />
                </div>
                <div>
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="39.90"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={type} onValueChange={(v: "income" | "expense") => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequência</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diária</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createRecurring} className="w-full">
                  Criar Recorrência
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recurring.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma transação recorrente
          </p>
        ) : (
          recurring.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {frequencyLabels[item.frequency]} • {item.is_active ? "Ativo" : "Inativo"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${item.type === "income" ? "text-success" : "text-destructive"}`}>
                  {item.type === "income" ? "+" : "-"}R$ {item.amount.toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRecurring(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
