import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Keyboard, Sparkles, Network, DollarSign, BookOpen, BarChart3, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            📚 Manual Completo do Sistema
          </DialogTitle>
          <DialogDescription>
            Guia completo de funcionalidades, atalhos e recursos avançados
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="shortcuts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shortcuts">Atalhos</TabsTrigger>
            <TabsTrigger value="features">Recursos</TabsTrigger>
            <TabsTrigger value="ai">IA & Análise</TabsTrigger>
            <TabsTrigger value="tips">Dicas</TabsTrigger>
          </TabsList>

          {/* Atalhos de Teclado */}
          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5 text-accent" />
                  ⌨️ Atalhos de Teclado
                </CardTitle>
                <CardDescription>Acelere seu fluxo de trabalho</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">Navegação</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Dashboard</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + H</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Finanças</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + F</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Nova Nota</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + N</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mapa Mental</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + M</kbd>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary">Comandos</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Paleta de Comandos</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + K</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Ajuda</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">F1</kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Salvar</span>
                        <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl + S</kbd>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Dica:</strong> Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl + K</kbd> para acessar rapidamente qualquer funcionalidade através da Paleta de Comandos!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recursos do Sistema */}
          <TabsContent value="features" className="space-y-4">
            {/* Sistema de Notas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-accent" />
                  📝 Sistema de Notas Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">🔗 Criando Conexões</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use <code className="bg-muted px-1.5 py-0.5 rounded">[[título da nota]]</code> em qualquer lugar do conteúdo para criar links automáticos.
                  </p>
                  <div className="bg-secondary/50 p-3 rounded-md text-sm">
                    <strong>Exemplo:</strong> "Este projeto está relacionado com [[Planejamento 2024]] e [[Orçamento]]"
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-primary">🏷️ Tags e Organização</h4>
                  <p className="text-sm text-muted-foreground">
                    Adicione tags separadas por vírgula: <code className="bg-muted px-1.5 py-0.5 rounded">trabalho, urgente, 2024</code>
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">✍️ Markdown & Formatação</h4>
                  <p className="text-sm text-muted-foreground">Suporte completo a Markdown:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                    <li><code className="bg-muted px-1 rounded"># Título</code> - Cabeçalhos</li>
                    <li><code className="bg-muted px-1 rounded">**negrito**</code> - Texto em negrito</li>
                    <li><code className="bg-muted px-1 rounded">*itálico*</code> - Texto em itálico</li>
                    <li><code className="bg-muted px-1 rounded">- item</code> - Listas</li>
                    <li><code className="bg-muted px-1 rounded">```código```</code> - Blocos de código</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">💾 Salvamento Automático</h4>
                  <p className="text-sm text-muted-foreground">
                    Suas notas são salvas automaticamente a cada 3 segundos. Nunca mais perca seu trabalho!
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🔍 Modo Foco</h4>
                  <p className="text-sm text-muted-foreground">
                    Clique no ícone de minimizar para ativar o modo foco - interface minimalista para escrita sem distrações.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mapa Mental */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  🧠 Mapa Mental Personalizável
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">🎨 Personalização Visual (NOVO!)</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li><strong>Tipo de Linha:</strong> Escolha entre linhas retas ou curvas</li>
                    <li><strong>Cor das Conexões:</strong> 6 opções de cores temáticas</li>
                    <li><strong>Espessura:</strong> Ajuste de 1 a 8 pixels</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🔗 Conexões Manuais</h4>
                  <p className="text-sm text-muted-foreground">
                    1. Clique em "Conectar"<br />
                    2. Selecione a primeira nota<br />
                    3. Selecione a segunda nota<br />
                    4. Conexão criada! (aparece em roxo)
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🖱️ Navegação Interativa</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Arraste para mover o mapa</li>
                    <li>Scroll para zoom in/out</li>
                    <li>Clique direito em nota para excluir</li>
                    <li>Clique em nota para editar</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🎯 Filtros Inteligentes</h4>
                  <p className="text-sm text-muted-foreground">
                    Filtre por tags, pastas ou visualize tudo. As cores dos nós representam diferentes categorias.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Finanças */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-success" />
                  💰 Controle Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">📊 Categorias Personalizadas</h4>
                  <p className="text-sm text-muted-foreground">
                    Crie categorias com cores e ícones para organizar receitas e despesas. Visualize gastos por categoria em gráficos.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🔁 Transações Recorrentes</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure pagamentos ou recebimentos automáticos (mensal, semanal, anual). O sistema gera as transações automaticamente.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🎯 Metas Financeiras</h4>
                  <p className="text-sm text-muted-foreground">
                    Defina objetivos de economia com valor alvo e prazo. Acompanhe o progresso com barras visuais.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">📅 Visualização Mensal</h4>
                  <p className="text-sm text-muted-foreground">
                    Navegue entre meses para ver histórico completo. Gráficos automáticos mostram tendências de gastos.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Diário */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-accent" />
                  📖 Diário Pessoal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">😊 Registro de Humor</h4>
                  <p className="text-sm text-muted-foreground">
                    5 opções de humor (Ótimo, Bom, Neutro, Ruim, Péssimo) com ícones e cores. Acompanhe seu bem-estar ao longo do tempo.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">📝 Entradas Organizadas</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada entrada possui título, conteúdo, data e humor. Organize em pastas para diferentes aspectos da vida.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-warning" />
                  📊 Estatísticas & Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">⏱️ Tempo de Uso</h4>
                  <p className="text-sm text-muted-foreground">
                    Rastreamento automático de tempo por módulo. Veja quanto tempo gasta em cada área.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🔥 Sequências</h4>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe dias consecutivos de uso. Mantenha a motivação com recordes pessoais!
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">📈 Gráficos de Evolução</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualize sua produtividade ao longo de 30 dias com gráficos interativos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IA e Análise */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  🤖 Inteligência Artificial
                </CardTitle>
                <CardDescription>Recursos avançados de IA integrados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">💬 Chat Inteligente</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Converse sobre suas notas, finanças e metas</li>
                    <li>IA com acesso ao seu contexto completo</li>
                    <li>Sugestões personalizadas baseadas em seus dados</li>
                    <li>Histórico completo de conversas salvo</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">🧠 Análise de Conexões</h4>
                  <p className="text-sm text-muted-foreground">
                    A IA sugere notas relacionadas baseando-se em similaridade semântica e temas comuns. Clique em "Analisar Conexões" ao editar uma nota.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">✍️ Correção Automática</h4>
                  <p className="text-sm text-muted-foreground">
                    Corrige gramática, ortografia e melhora a clareza do texto automaticamente. Disponível ao editar notas.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">📊 Insights Financeiros</h4>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li><strong>Resumo Semanal:</strong> Análise automática de gastos</li>
                    <li><strong>Análise de Padrões:</strong> Identifica tendências de gastos</li>
                    <li><strong>Sugestões de Metas:</strong> Recomendações de economia</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dicas e Truques */}
          <TabsContent value="tips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>💡 Dicas & Truques</CardTitle>
                <CardDescription>Aproveite ao máximo o sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <h4 className="font-semibold mb-2 text-success flex items-center gap-2">
                    🚀 Produtividade
                  </h4>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Use a Paleta de Comandos (Ctrl+K) para navegação rápida</li>
                    <li>Organize notas com [[links]] para criar conhecimento conectado</li>
                    <li>Configure transações recorrentes uma vez e esqueça</li>
                    <li>Revise estatísticas semanalmente para acompanhar progresso</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                    🎨 Personalização
                  </h4>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Customize cores do mapa mental para sua preferência</li>
                    <li>Crie categorias financeiras com cores temáticas</li>
                    <li>Use pastas para organizar diferentes projetos/áreas</li>
                    <li>Alterne entre modo claro/escuro conforme ambiente</li>
                  </ul>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <h4 className="font-semibold mb-2 text-accent flex items-center gap-2">
                    🔒 Segurança & Backup
                  </h4>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Todos os dados são salvos automaticamente no banco de dados</li>
                    <li>Exporte notas regularmente como backup</li>
                    <li>Use senhas fortes e únicas</li>
                    <li>Dados sincronizados em tempo real entre dispositivos</li>
                  </ul>
                </div>

                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <h4 className="font-semibold mb-2 text-warning flex items-center gap-2">
                    🌍 Multi-idioma
                  </h4>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Sistema disponível em Português e Inglês</li>
                    <li>Detecção automática do idioma do navegador</li>
                    <li>Troca de idioma nas configurações (ícone de bandeiras)</li>
                    <li>Preferência salva automaticamente no banco</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-gradient-primary rounded-lg text-white">
          <p className="text-center text-sm">
            <strong>Dúvidas?</strong> Explore o sistema e descubra mais recursos! A melhor forma de aprender é experimentando. 🚀
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}