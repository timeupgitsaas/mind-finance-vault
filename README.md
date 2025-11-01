# 🚀 Time Up Flow - Sistema SaaS Pessoal com IA

Sistema web pessoal completo e moderno com autenticação segura (email + Google OAuth), gerenciamento financeiro avançado, sistema de notas tipo Obsidian com mapa mental interativo, assistente de IA integrado e múltiplas funcionalidades de produtividade.

## 📋 Índice

- [Funcionalidades Principais](#-funcionalidades-principais)
- [Autenticação e Segurança](#-autenticação-e-segurança)
- [Tecnologias](#️-tecnologias)
- [Configuração Inicial](#️-configuração-inicial)
- [Como Usar](#-como-usar)
- [Segurança Implementada](#-segurança-implementada)

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

## ⚙️ Configuração Inicial

### 1. Clonar o Repositório

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

### 2. Configurar Autenticação

O sistema já está configurado com **Lovable Cloud**, incluindo:
- ✅ Banco de dados PostgreSQL
- ✅ Autenticação com email
- ✅ Sistema de usuários
- ✅ Edge Functions para IA

### 3. Ativar Login com Google (Opcional)

Siga os passos em [Autenticação e Segurança](#-autenticação-e-segurança)

### 4. Primeiro Acesso

1. Acesse `http://localhost:5173` (desenvolvimento)
2. Vá para `/auth` para criar sua conta
3. Escolha entre email ou Google
4. Se usar email, **verifique seu email** antes de fazer login

## 📱 Como Usar

### Dashboard Principal

Após fazer login, você terá acesso ao dashboard com:
- **Estatísticas financeiras** em tempo real
- **Gráficos interativos** de receitas e despesas
- **Widgets personalizáveis** (arraste para reorganizar)
- **Chat com IA** integrado
- **Insights automáticos**

### 💰 Gerenciar Finanças

1. **Adicionar Transação**:
   - Clique em "Nova Transação" ou pressione `Ctrl+K`
   - Preencha descrição, valor, categoria e tipo
   - Salve e veja os gráficos atualizarem

2. **Criar Categorias**:
   - Vá em "Categorias"
   - Crie categorias personalizadas com cores e ícones
   - Organize suas finanças do seu jeito

3. **Definir Metas**:
   - Acesse "Metas Financeiras"
   - Defina valor alvo e prazo
   - Acompanhe o progresso em tempo real

4. **Despesas Recorrentes**:
   - Configure assinaturas e contas fixas
   - O sistema lembrará você automaticamente
   - Veja o impacto mensal das recorrências

5. **Exportar Dados**:
   - Exporte para Google Sheets
   - Faça backup no Google Drive
   - Baixe relatórios em CSV

### 📝 Sistema de Notas

1. **Criar Notas**:
   - Pressione `Ctrl+K` → "Nova Nota"
   - Use Markdown para formatação
   - Adicione tags para organização

2. **Links Internos**:
   - Use `[[nome-da-nota]]` para criar links
   - Navegue entre notas facilmente
   - Construa sua rede de conhecimento

3. **Mapa Mental**:
   - Visualize conexões entre notas
   - Modo 2D e 3D disponíveis
   - Organize ideias visualmente

4. **Busca Inteligente**:
   - Busca semântica com IA
   - Encontre notas por contexto
   - Sugestões automáticas de conexões

### 🤖 Assistente de IA

1. **Chat com IA**:
   - Pergunte sobre seus dados
   - Exemplos:
     - "Quanto gastei este mês em alimentação?"
     - "Resuma minhas notas sobre projetos"
     - "Quais metas estou mais próximo de atingir?"

2. **Insights Automáticos**:
   - **Resumo Semanal**: Visão geral da semana
   - **Análise de Gastos**: Padrões e oportunidades
   - **Sugestões de Metas**: Baseadas no seu histórico

3. **Análise de Notas**:
   - Sugestões de conexões entre notas
   - Identificação de temas comuns
   - Recomendações de organização

### ⌨️ Terminal de Comandos (Ctrl+K)

Pressione `Ctrl+K` e digite:
- `nova nota` - Criar nota rápida
- `nova transação` - Adicionar transação
- `chat ia` - Abrir chat com IA
- `modo escuro` - Alternar tema
- `estatísticas` - Ver relatórios
- `mapa mental` - Visualizar notas
- `buscar` - Busca global

## 🔐 Autenticação e Segurança

### Sistema de Autenticação

O sistema oferece **duas formas de acesso**:

#### 1. **Login com Email e Senha** 
- Cadastro tradicional com email e senha (mínimo 6 caracteres)
- **Verificação de email obrigatória** após cadastro
- Sistema de recuperação de senha
- Sessão persistente e segura

#### 2. **Login Social com Google**
- Login rápido via conta Google
- OAuth 2.0 integrado
- Sem necessidade de senha
- Acesso instantâneo após autorização

### Como Criar Conta

1. Acesse a página de login em `/auth`
2. Escolha entre:
   - **Criar conta** (email/senha) - Será necessário verificar o email
   - **Entrar com Google** - Acesso imediato após autorização
3. Após login, você será redirecionado para o dashboard

### Configuração do Login com Google

Para ativar o login com Google, configure no **Lovable Cloud**:

<lov-actions>
  <lov-open-backend>Configurar Login Google</lov-open-backend>
</lov-actions>

Vá em **Users → Auth Settings → Google Settings** e adicione:
- **Client ID** do Google Cloud Console
- **Client Secret** do Google Cloud Console

#### Criar Credenciais Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie/selecione um projeto
3. Vá em **APIs & Services > Credentials**
4. Clique **Create Credentials > OAuth client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: 
     - `https://seu-projeto.lovableproject.com`
     - `https://seu-dominio.com` (se tiver)
   - **Authorized redirect URIs**:
     - `https://odkwywctpcntgvojnkor.supabase.co/auth/v1/callback`
6. Copie o **Client ID** e **Client Secret**
7. Cole nas configurações do Lovable Cloud

### URLs Autorizadas

Certifique-se de adicionar estas URLs no Google Cloud Console:

**JavaScript origins**:
- `https://6b0351b3-5643-4969-a15a-38cd8cd9945c.lovableproject.com`
- Seu domínio personalizado (se tiver)

**Redirect URIs**:
- `https://odkwywctpcntgvojnkor.supabase.co/auth/v1/callback`

## 🔒 Segurança Implementada

### Proteção de Dados
- ✅ **Row Level Security (RLS)** em todas as tabelas
- ✅ **Políticas de acesso** granulares por usuário
- ✅ **Isolamento completo** de dados entre usuários
- ✅ Apenas o dono pode ver/editar seus dados

### Autenticação Segura
- ✅ Senhas criptografadas com bcrypt
- ✅ Verificação de email obrigatória
- ✅ OAuth 2.0 com Google
- ✅ Tokens JWT seguros e com renovação automática
- ✅ Sessões persistentes em localStorage

### Proteção de Dados Sensíveis
- ✅ **Transações financeiras**: protegidas por RLS
- ✅ **Entradas de diário**: visíveis apenas pelo autor
- ✅ **Conversas com IA**: privadas por usuário
- ✅ **Tokens Google**: criptografados e isolados
- ✅ **Notas e anotações**: acesso restrito ao dono

### Políticas RLS Implementadas

Todas as tabelas possuem políticas completas de:
- **SELECT**: Usuário vê apenas seus dados
- **INSERT**: Usuário cria apenas para si
- **UPDATE**: Usuário edita apenas seus dados
- **DELETE**: Usuário remove apenas seus dados

Tabelas protegidas:
- `notes` (notas e anotações)
- `transactions` (finanças)
- `categories` (categorias personalizadas)
- `financial_goals` (metas financeiras)
- `recurring_transactions` (despesas recorrentes)
- `diary_entries` (entradas de diário)
- `ai_conversations` (conversas com IA)
- `ai_feedback` (feedback da IA)
- `google_tokens` (tokens OAuth)
- `exports` (exportações)
- `user_statistics` (estatísticas)
- `user_preferences` (preferências)
- `folders` (pastas de organização)

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
