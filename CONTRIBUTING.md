# Guia de Contribuição

Obrigado por querer contribuir com o Gil Corretor SP! Este documento descreve as melhores práticas, padrões de código e processo de contribuição.

## 📋 Sumário

- [Como Começar](#como-começar)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Guia de Commits](#guia-de-commits)
- [Checklist de Qualidade](#checklist-de-qualidade)

## 🚀 Como Começar

### 1. Fork & Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/seu-usuario/gil-corretorsp.git
cd gil-corretorsp

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original/gil-corretorsp.git
```

### 2. Setup Ambiente

```bash
npm install
cp .env.example .env.local
# Configure suas credenciais Supabase
npm run dev
```

### 3. Crie uma Branch

```bash
# Sempre a partir de develop ou main
git checkout develop
git pull upstream develop

# Crie uma branch descritiva
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

## 📝 Padrões de Código

### JavaScript/TypeScript

#### Nomenclatura

```javascript
// ✅ BOM - descritivo e claro
const MAX_PROPERTIES_PER_PAGE = 20;
const getUserById = async (id: string) => {};
const isValidEmail = (email: string) => {};
const PropertyCard: React.FC = () => {};

// ❌ RUIM - ambíguo
const MAX = 20;
const get = async (id) => {};
const check = (e) => {};
const PC = () => {};
```

#### Organização de Imports

```javascript
// 1. React e bibliotecas de terceiros
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// 2. Componentes locais
import { Button } from '@/components/ui/Button';
import PropertyCard from '@/components/PropertyCard';

// 3. Hooks customizados
import { useAuth } from '@/hooks/useAuth';
import { useProperty } from '@/hooks/useProperty';

// 4. Utilitários e tipos
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/formatters';
import type { Property } from '@/types/property';
```

#### TypeScript - Tipos Explícitos

```typescript
// ✅ BOM - tipos explícitos
interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  onFavoriteClick?: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  price,
  imageUrl,
  onFavoriteClick,
}) => {
  return <div>{/* ... */}</div>;
};

// ❌ RUIM - tipos implícitos
const PropertyCard = (props: any) => {
  return <div>{/* ... */}</div>;
};
```

### Componentes React

#### Estrutura Básica

```javascript
import { memo } from 'react';

/**
 * PropertyCard - Exibe um card de propriedade
 *
 * @param id - ID único da propriedade
 * @param title - Título da propriedade
 * @returns JSX do card
 */
const PropertyCard = memo(({ id, title }: PropertyCardProps) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{title}</h3>
      {/* Conteúdo */}
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
```

#### Hooks com TypeScript

```typescript
import { useState, useEffect, useCallback } from 'react';

interface Property {
  id: string;
  title: string;
  price: number;
}

/**
 * Hook para buscar propriedade por ID
 */
export const useProperty = (id: string): [Property | null, boolean, Error | null] => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // fetch logic
        setProperty(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  return [property, loading, error];
};
```

### CSS/Tailwind

```javascript
// ✅ BOM - classes em ordem lógica
<div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-md">
  {/* Conteúdo */}
</div>

// ❌ RUIM - classes desorganizadas
<div className="shadow-md rounded-lg p-4 bg-white justify-between gap-4 items-center flex">
  {/* Conteúdo */}
</div>

// ✅ BOM - usar cn() para classes condicionais
import { cn } from '@/lib/utils';

<div className={cn(
  'p-4 rounded-lg',
  isActive && 'bg-blue-500 text-white',
  isDisabled && 'opacity-50 cursor-not-allowed'
)}>
  {/* Conteúdo */}
</div>
```

## 🔄 Processo de Pull Request

### 1. Antes de Fazer o PR

```bash
# Atualize sua branch com as mudanças mais recentes
git fetch upstream
git rebase upstream/develop

# Execute os checks
npm run lint:fix
npm run format
npm run type-check
npm run test:ci

# Build deve passar
npm run build
```

### 2. Crie o PR

**Título:** Siga o formato Conventional Commits
```
feat: Adicionar filtro de preço
fix: Corrigir layout mobile
docs: Atualizar README
test: Adicionar testes para PropertyCard
chore: Atualizar dependências
```

**Descrição:**
```markdown
## Descrição
Breve descrição do que foi feito.

## Por quê?
Explicação do contexto e motivação.

## Como testar?
1. Passos para testar a mudança
2. Resultado esperado
3. Screenshots/videos se aplicável

## Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Sem breaking changes
- [ ] Responsivo em mobile
```

### 3. Review & Merge

- Aguarde pelo menos 1 review aprovado
- Resolve comentários e requests
- Faça rebase se necessário
- Merge apenas com approval

## 📌 Guia de Commits

### Formato Conventional Commits

```
<tipo>(<escopo>): <assunto>

<corpo>

<rodapé>
```

#### Tipos

- **feat**: Nova feature
- **fix**: Correção de bug
- **docs**: Mudanças em documentação
- **style**: Mudanças de formatação (não alteram funcionalidade)
- **refactor**: Refatoração de código
- **perf**: Melhorias de performance
- **test**: Adicionar/atualizar testes
- **chore**: Atualizações de build, deps, etc

#### Exemplos

```bash
# Feature
git commit -m "feat(properties): adicionar filtro de preço"

# Bug fix
git commit -m "fix(auth): corrigir erro de login com Google"

# Refactor
git commit -m "refactor(hooks): simplificar useProperty hook"

# Com corpo
git commit -m "feat(image): otimizar compressão de imagens

- Adicionar compressão WebP
- Reduzir tamanho em 40%
- Adicionar fallback para navegadores antigos"
```

## ✅ Checklist de Qualidade

Antes de submeter seu PR, verifique:

### Código
- [ ] ESLint passou sem erros: `npm run lint`
- [ ] Prettier formatou corretamente: `npm run format`
- [ ] TypeScript sem erros: `npm run type-check`
- [ ] Nenhuma variável não usada
- [ ] Nenhum `console.log` ou `debugger` em produção

### Testes
- [ ] Testes novos adicionados
- [ ] Testes existentes ainda passam: `npm run test`
- [ ] Coverage não diminuiu
- [ ] E2E tests passam: `npm run test:e2e`

### Documentação
- [ ] README atualizado se necessário
- [ ] Componentes têm comentários JSDoc
- [ ] Funções têm tipos explícitos

### Performance
- [ ] Build não aumentou significativamente
- [ ] Sem memory leaks em Hooks
- [ ] Componentes são memoizados quando apropriado

### Acessibilidade
- [ ] Elementos interativos têm atributos `aria-*` apropriados
- [ ] Cores têm contraste adequado
- [ ] Navegação com teclado funciona
- [ ] Testado com screen reader

### Mobile
- [ ] Responsivo em todos os breakpoints
- [ ] Touch targets têm tamanho adequado (min 44x44px)
- [ ] Testado em dispositivo real ou simulado

## 🐛 Reportando Bugs

Se encontrar um bug, abra uma Issue com:

```markdown
## Descrição
Descrição clara do bug.

## Passos para Reproduzir
1. Passo 1
2. Passo 2
3. ...

## Resultado Esperado
O que deveria acontecer.

## Resultado Atual
O que realmente aconteceu.

## Ambiente
- OS: Windows/macOS/Linux
- Node: 22.x
- Browser: Chrome/Firefox/Safari
- Screenshots/videos se possível
```

## 🎯 Boas Práticas Gerais

### Performance
- Lazy load componentes quando possível
- Memoizar componentes pesados
- Evitar re-renders desnecessários
- Usar `useCallback` para callbacks em lists

### Segurança
- Nunca expor chaves secretas em código
- Sanitizar inputs de usuários
- Validar dados no backend
- Usar HTTPS para toda comunicação

### DX (Developer Experience)
- Adicione tipos TypeScript
- Escreva código legível e bem comentado
- Use nomes descritivos
- Mantenha funções pequenas e focadas

### User Experience
- Sempre pense na experiência mobile
- Use loading states e error boundaries
- Forneça feedback de ações
- Teste acessibilidade

## 📚 Recursos Adicionais

- [MDN Web Docs](https://developer.mozilla.org)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org)

---

Obrigado por contribuir! 🎉
