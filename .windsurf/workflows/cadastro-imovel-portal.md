---
description: Fluxo padrão de cadastro de imóvel (portal) com imagens no Supabase Storage
---

# Objetivo

Padronizar o cadastro de imóveis e o armazenamento de imagens/plantas para evitar URLs duplicadas, erro 400/404 e inconsistência entre ambientes.

# Padrão obrigatório (regra de ouro)

- **Banco (`properties.images` e `properties.floor_plans`/`plans_urls`)**: salvar **apenas o path do Storage** (string).
  - Ex.: `prop_1710000000000_ab12cd3.webp`
  - Ex.: `plans/plan_1710000000000_ef45gh6.png`
- **Frontend**: gerar URL pública apenas para exibição (preview/render).

# Fluxo de cadastro (Admin)

## 1) Criar imóvel

- Preencher `title`, `neighborhood`, `address`, `business_type`, etc.
- Validar `slug` disponível.

## 2) Upload de fotos

- Fazer upload na aba **Mídia**.
- Ao concluir cada upload:
  - O arquivo é enviado para o bucket `property-images`.
  - O formulário armazena no estado (e no banco ao salvar) **somente o `path`**.

## 3) Upload de plantas

- Fazer upload na seção **Plantas Humanizadas**.
- O formulário armazena e persiste **somente o `path`** (`plans/...`).

## 4) Adicionar imagem via URL (opcional)

- Se for uma URL do próprio Supabase Storage (bucket `property-images`), o admin converte automaticamente para **path** antes de salvar.
- Se for URL externa, permanece como URL (uso excepcional).

## 5) Salvar

- No `submit`, o admin normaliza:
  - URLs do Supabase → `path`
  - Paths já existentes → mantém
  - Remove valores vazios

# Regras de validação / QA

- Em um imóvel recém-salvo, a coluna `images` deve conter **paths**, não URLs completas.
- Testar:
  - Página de detalhe `/imovel/:slug`
  - Listagem
  - Modo anônimo (sem cache)

# Migração/compatibilidade

- Ao editar e salvar um imóvel antigo que tenha URLs completas do Supabase, o admin converte para path automaticamente.
