# 🏠 Gil Corretor SP - Real Estate Platform

A moderna plataforma web para gestão e comercialização de imóveis, construída com React 18, Vite e Supabase.

## 📋 Tabela de Conteúdos

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Local](#setup-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testing](#testing)
- [Deployment](#deployment)

## ✨ Features

- 🏡 Gestão completa de propriedades (CRUD)
- 🔐 Autenticação segura com Supabase
- 📊 Dashboard admin com métricas
- 🗺️ Integração com mapas (Leaflet)
- 📸 Galeria de imagens otimizada
- 🔍 Search avançado com filtros
- 📱 Responsivo (mobile-first)
- 🎯 SEO otimizado
- 💬 Chat com clientes (Tidio)
- 📈 Analytics integrado (Google Analytics)

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Radix UI  
**Backend:** Supabase (PostgreSQL, Auth, Storage)  
**Testing:** Jest, React Testing Library, Playwright  
**DevOps:** ESLint, Prettier, GitHub Actions, Vercel

## 🚀 Setup Local

### Pré-requisitos
- Node.js 22.x
- npm ou yarn

### Instalação

```bash
# Clone
git clone https://github.com/seu-usuario/gil-corretorsp.git
cd gil-corretorsp

# Instale dependências
npm install

# Configure .env
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Inicie dev server
npm run dev
```

O app estará em `http://localhost:3000`

## 🔐 Variáveis de Ambiente

Criar `.env.local`:

```bash
# SUPABASE (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon

# GOOGLE ANALYTICS (opcional)
VITE_GA_ID=G-XXXXXXXXXX
```

**⚠️ Segurança:** Nunca commite `.env.local`

## 📝 Scripts Disponíveis

```bash
npm run dev           # Dev server (port 3000)
npm run build         # Build para produção
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier format
npm run type-check    # TypeScript check
npm run test          # Jest watch
npm run test:e2e      # Playwright E2E
```

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes React
├── pages/           # Páginas da app
├── lib/             # Utilitários (supabase.js, etc)
├── hooks/           # Custom hooks
├── services/        # Backend services
├── utils/           # Funções auxiliares
├── context/         # Auth context
└── setupTests.ts    # Jest setup

plugins/             # Plugins Vite
python/              # Scripts Python
tests/               # E2E tests
```

## ✅ Testing

**Unit tests:**
```bash
npm run test
```

**E2E tests:**
```bash
npm run test:e2e
```

**Coverage:**
```bash
npm run test:ci
```

## 🚀 Deployment

### Vercel (Recomendado)

1. Push para GitHub
2. Importe o projeto no [vercel.com](https://vercel.com)
3. Configure environment variables
4. Deploy automático em cada push

### Build Local

```bash
npm run build
npm run preview
```

## 📚 Recursos

- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Abra um Pull Request

**Checklist:**
- [ ] `npm run lint:fix` executado
- [ ] `npm run format` executado
- [ ] `npm run type-check` passou
- [ ] `npm run test` passou
- [ ] Testes E2E adicionados

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

**Última atualização:** 20 de Abril de 2026
