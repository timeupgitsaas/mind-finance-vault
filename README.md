# 🚀 Sistema SaaS Pessoal com IA

Sistema web pessoal completo e moderno com autenticação, gerenciamento financeiro, sistema de notas tipo Obsidian com mapa mental, assistente de IA integrado e integração com Google Drive/Sheets.

## ✨ Funcionalidades Principais

### 🤖 Assistente de IA
- ✅ Chat inteligente com seus dados
- ✅ Análise automática de gastos e padrões
- ✅ Sugestões de metas baseadas em histórico
- ✅ Resumos semanais automáticos
- ✅ Insights personalizados sobre finanças
- ✅ Busca semântica em notas e transações

### ⌨️ Terminal de Comandos (Ctrl+K)
- ✅ Acesso rápido a todas funcionalidades
- ✅ Navegação instantânea entre seções
- ✅ Criação rápida de notas e transações
- ✅ Controles de tema e aparência
- ✅ Interface estilo spotlight

### 💰 Módulo Financeiro Avançado
- ✅ Gerenciamento de receitas e despesas
- ✅ Categorias personalizadas com cores e ícones
- ✅ Metas financeiras com acompanhamento de progresso
- ✅ Despesas recorrentes (assinaturas, contas fixas)
- ✅ Relatórios e gráficos interativos
- ✅ Filtros por categoria, tipo e período
- ✅ Exportação para Google Sheets

### 🧠 Sistema de Notas Inteligente
- ✅ Editor Markdown com preview em tempo real
- ✅ Sistema de links internos estilo Obsidian `[[nota]]`
- ✅ Tags para organização e busca
- ✅ Busca semântica com IA
- ✅ Conexões automáticas sugeridas pela IA
- ✅ Mapa mental interativo 2D/3D
- ✅ Cores personalizadas por nota
- ✅ Modo Zen para foco total

### ☁️ Integração Google (Moderna com SDK)
- ✅ Login via Google Identity Services SDK
- ✅ Sem redirecionamentos manuais
- ✅ OAuth 2.0 individual por usuário
- ✅ Exportar dados financeiros para Google Sheets
- ✅ Backup automático no Google Drive
- ✅ Importar planilhas do Drive
- ✅ Backup manual sob demanda
- ✅ Tokens salvos de forma segura

### 🎨 Interface & UX Premium
- ✅ Modo escuro/claro com detecção automática
- ✅ Design moderno com gradientes roxo/azul
- ✅ Animações suaves e transições fluidas
- ✅ Terminal de comandos (Ctrl+K)
- ✅ Dashboard personalizável (arrastar widgets)
- ✅ 100% responsivo para mobile
- ✅ Tema dinâmico por horário

## 🛠️ Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Lovable Cloud (Supabase)
- **Banco de Dados**: PostgreSQL com RLS
- **IA**: Lovable AI (Gemini 2.5 Flash)
- **Autenticação**: Supabase Auth
- **Edge Functions**: Deno
- **Estilo**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Editor**: @uiw/react-md-editor
- **Visualização**: react-force-graph-2d

## ⚙️ Configuração da Integração Google

### Por que usar o SDK Google Identity Services?

A implementação anterior usava OAuth manual com redirects, o que causava erros 404 e era mais complexa. 
Agora usamos o **Google Identity Services SDK**, que é:
- ✅ Mais moderno e recomendado pelo Google
- ✅ Sem redirects complicados
- ✅ Login em popup ou inline
- ✅ Integração mais simples
- ✅ Melhor experiência do usuário

### Passos para Configurar

#### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Habilite as APIs necessárias:
   - **Google Drive API**
   - **Google Sheets API**

#### 2. Configurar Credenciais OAuth 2.0

1. Vá para **APIs & Services > Credentials**
2. Clique em **Create Credentials > OAuth client ID**
3. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**: (não necessário para SDK, mas configure se usar as edge functions)
     - `https://seu-projeto.lovableproject.com`

4. Copie o **Client ID** gerado

#### 3. Adicionar Client ID ao Código

Edite o arquivo `src/components/GoogleSignIn.tsx`:

```typescript
client_id: "SEU_CLIENT_ID_AQUI.apps.googleusercontent.com"
```

#### 4. (Opcional) Configurar Secrets para Backup

Se quiser usar as funcionalidades de backup no Drive, adicione no Backend:

<lov-actions>
  <lov-open-backend>Abrir Backend</lov-open-backend>
</lov-actions>

Adicione os secrets:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Testando a Integração

1. Abra o dashboard da aplicação
2. Clique em "Entrar com Google"
3. Faça login com sua conta Google
4. Conceda as permissões necessárias
5. Você verá seu nome e email exibidos

## 🤖 Como Usar a IA

### Chat com IA
- Acesse o dashboard e use o widget "Chat com IA"
- Faça perguntas sobre seus dados:
  - "Quanto gastei este mês?"
  - "Quais são minhas notas sobre marketing?"
  - "Resuma meu progresso nas metas"

### Insights Automáticos
- No widget "Insights com IA", escolha:
  - **Resumo Semanal**: Análise geral da semana
  - **Análise de Gastos**: Identifica padrões e oportunidades
  - **Sugestões de Metas**: IA sugere metas baseadas no seu histórico

### Terminal de Comandos
- Pressione **Ctrl+K** (ou Cmd+K no Mac)
- Digite comandos como:
  - "Nova nota"
  - "Adicionar transação"
  - "Chat com IA"
  - "Modo escuro"

## 🔐 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) em todas as tabelas
- Tokens Google criptografados
- OAuth 2.0 individual por usuário

---

## Project info from Lovable

**URL**: https://lovable.dev/projects/6b0351b3-5643-4969-a15a-38cd8cd9945c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6b0351b3-5643-4969-a15a-38cd8cd9945c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6b0351b3-5643-4969-a15a-38cd8cd9945c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
