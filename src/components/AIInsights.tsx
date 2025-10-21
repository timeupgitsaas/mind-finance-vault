import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Target, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AIInsights() {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async (type: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: { type },
      });

      if (error) throw error;

      setInsights(data.insights);
      toast({
        title: "Insights gerados!",
        description: "A IA analisou seus dados com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar insights",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Insights com IA
        </CardTitle>
        <CardDescription>
          Análises automáticas dos seus dados financeiros e notas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">
              <Calendar className="w-4 h-4 mr-2" />
              Semanal
            </TabsTrigger>
            <TabsTrigger value="spending">
              <TrendingUp className="w-4 h-4 mr-2" />
              Gastos
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="w-4 h-4 mr-2" />
              Metas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <div className="space-y-4">
              <Button
                onClick={() => generateInsights("weekly-summary")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Gerar Resumo Semanal
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="spending">
            <div className="space-y-4">
              <Button
                onClick={() => generateInsights("spending-analysis")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analisar Padrões de Gastos
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="space-y-4">
              <Button
                onClick={() => generateInsights("goal-suggestions")}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Sugerir Metas
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {insights && (
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Análise da IA
            </h4>
            <p className="text-sm whitespace-pre-wrap">{insights}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
