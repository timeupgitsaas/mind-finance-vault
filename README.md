# SaaS Pessoal - Sistema Web Completo

Sistema web pessoal completo com gerenciamento financeiro, sistema de notas tipo Obsidian, mapa mental e integração com Google Drive/Sheets.

## 🚀 Funcionalidades

### 💰 Módulo Financeiro
- ✅ Gerenciamento de receitas e despesas
- ✅ Categorias personalizadas com cores e ícones
- ✅ Metas financeiras com acompanhamento de progresso
- ✅ Despesas recorrentes (assinaturas, contas fixas)
- ✅ Relatórios e gráficos interativos
- ✅ Filtros por categoria, tipo e período
- ✅ Exportação para Google Sheets

### 🧠 Sistema de Notas
- ✅ Editor Markdown com preview em tempo real
- ✅ Sistema de links internos estilo Obsidian `[[nota]]`
- ✅ Tags para organização
- ✅ Busca por título, conteúdo e tags
- ✅ Mapa mental interativo visualizando conexões
- ✅ Cores personalizadas por nota

### ☁️ Integração Google
- ✅ OAuth 2.0 individual por usuário
- ✅ Exportar dados financeiros para Google Sheets
- ✅ Backup automático no Google Drive
- ✅ Tokens criptografados e seguros

### 🎨 Interface & UX
- ✅ Modo escuro automático (detecção do sistema)
- ✅ Design moderno com gradientes roxo/azul
- ✅ Animações suaves
- ✅ 100% responsivo

## 🛠️ Tecnologias

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Lovable Cloud (Supabase)
- **Banco de Dados**: PostgreSQL
- **Autenticação**: Supabase Auth
- **Edge Functions**: Deno
- **Gráficos**: Recharts
- **Editor**: @uiw/react-md-editor
- **Visualização**: react-force-graph-2d

## ⚙️ Configuração da Integração Google

Para habilitar a integração com Google Drive e Sheets:

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Habilite as APIs: Google Drive API e Google Sheets API

### 2. Configurar OAuth 2.0

1. Vá para **APIs & Services > Credentials**
2. Crie credenciais OAuth 2.0:
   - Tipo: Web application
   - URIs de redirecionamento: `https://seu-projeto.supabase.co/functions/v1/google-auth`

### 3. Configurar Secrets

Adicione no Backend do Lovable Cloud:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

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
