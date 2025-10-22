import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Keyboard, Sparkles, Network, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Manual do Time Up Mind
          </DialogTitle>
          <DialogDescription>
            Guia completo de funcionalidades e atalhos do sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Atalhos de Teclado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Atalhos de Teclado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl + N</kbd>
                  <span className="ml-2 text-sm">Nova nota</span>
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl + M</kbd>
                  <span className="ml-2 text-sm">Mapa mental</span>
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl + F</kbd>
                  <span className="ml-2 text-sm">Finanças</span>
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl + H</kbd>
                  <span className="ml-2 text-sm">Dashboard</span>
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">Ctrl + K</kbd>
                  <span className="ml-2 text-sm">Comandos rápidos</span>
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono">F1</kbd>
                  <span className="ml-2 text-sm">Ajuda (esta janela)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sistema de Notas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Sistema de Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Criando Conexões</h4>
                <p className="text-sm text-muted-foreground">
                  Use <code className="bg-muted px-1 rounded">[[título da nota]]</code> para criar links automáticos entre notas.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Tags</h4>
                <p className="text-sm text-muted-foreground">
                  Adicione tags separadas por vírgula para organizar suas notas. Ex: trabalho, projeto, urgente
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Correção com IA</h4>
                <p className="text-sm text-muted-foreground">
                  Clique no botão de varinha mágica para corrigir automaticamente erros de português e gramática.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Modo Foco</h4>
                <p className="text-sm text-muted-foreground">
                  Ative o modo foco para escrever sem distrações com uma interface minimalista.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Salvamento Automático</h4>
                <p className="text-sm text-muted-foreground">
                  Suas notas são salvas automaticamente a cada 3 segundos enquanto você escreve.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mapa Mental */}
          <Card>
            <CardHeader>
              <CardTitle>Mapa Mental</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Visualização</h4>
                <p className="text-sm text-muted-foreground">
                  O mapa mental mostra todas as suas notas e suas conexões de forma visual e interativa.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Navegação</h4>
                <p className="text-sm text-muted-foreground">
                  Clique e arraste para mover o mapa. Use a roda do mouse para zoom. Clique em um nó para ver detalhes da nota.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Cores</h4>
                <p className="text-sm text-muted-foreground">
                  As cores dos nós representam diferentes tags e categorias das suas notas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* IA e Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                IA e Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Chat com IA</h4>
                <p className="text-sm text-muted-foreground">
                  Converse com a IA sobre suas notas, finanças e metas. A IA tem acesso aos seus dados e pode fornecer insights personalizados.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Histórico de Conversas</h4>
                <p className="text-sm text-muted-foreground">
                  Todas as conversas são salvas automaticamente. Acesse a aba "Histórico" para rever ou continuar conversas anteriores.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Análise Financeira</h4>
                <p className="text-sm text-muted-foreground">
                  Gere resumos semanais, análises de gastos e sugestões de investimento baseadas no seu histórico.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Finanças */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Módulo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold mb-1">Categorias</h4>
                <p className="text-sm text-muted-foreground">
                  Crie categorias personalizadas para organizar suas receitas e despesas.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Transações Recorrentes</h4>
                <p className="text-sm text-muted-foreground">
                  Configure pagamentos ou recebimentos automáticos que se repetem mensalmente.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Metas Financeiras</h4>
                <p className="text-sm text-muted-foreground">
                  Defina metas de economia e acompanhe seu progresso visualmente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}