# TypeScript Migration Guide

## Visão Geral

Este documento descreve o processo de migração gradual de JavaScript para TypeScript no projeto Gil Corretor SP.

## 🎯 Estratégia de Migração

**Abordagem:** Migração gradual sem breaking changes

1. **Fase 1:** Setup TypeScript ✅ (Completo)
2. **Fase 2:** Migrar tipos comuns (lib, utils)
3. **Fase 3:** Migrar hooks e services
4. **Fase 4:** Migrar componentes críticos
5. **Fase 5:** Migrar componentes restantes

## ✅ Fase 1: Setup (Concluído)

- ✅ Instalado TypeScript 5.3.3
- ✅ Criado `tsconfig.json`
- ✅ Configurado ESLint para .ts/.tsx
- ✅ Criado `setupTests.ts`

## 🔄 Fase 2: Tipos Comuns (Em Progresso)

### Passo 1: Criar arquivo `src/types/index.ts`

```typescript
// src/types/index.ts

// Property
export interface Property {
  id: string;
  slug: string;
  title: string;
  type: 'apartment' | 'house' | 'land' | 'commercial';
  business_type: 'sale' | 'rental';
  price?: number;
  rental_price?: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  garage?: number;
  neighborhood: string;
  address: string;
  description?: string;
  images?: string[];
  status: 'available' | 'sold' | 'rental';
  created_at: string;
  updated_at: string;
  views: number;
  leads_count: number;
}

// User
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

// Broker
export interface Broker {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  verified: boolean;
  created_at: string;
}

// Lead
export interface Lead {
  id: string;
  property_id: string;
  user_email: string;
  message?: string;
  phone?: string;
  created_at: string;
  status: 'new' | 'contacted' | 'closed';
}
```

### Passo 2: Migrar `src/lib` para TypeScript

Exemplo: Converter `slugGenerator.js` → `slugGenerator.ts`

**Antes:**
```javascript
// src/lib/slugGenerator.js
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
```

**Depois:**
```typescript
// src/lib/slugGenerator.ts
/**
 * Generates a URL-friendly slug from text
 * @param text - Text to slugify
 * @returns Slugified text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};
```

### Passo 3: Renomear e migrar arquivos

```bash
# Renomear arquivo
mv src/lib/slugGenerator.js src/lib/slugGenerator.ts

# Atualizar todos os imports no projeto
# Vite automaticamente resolve .ts
```

## 🪝 Fase 3: Migrar Hooks

### Exemplo: `useProperty.js` → `useProperty.ts`

**Antes:**
```javascript
// src/hooks/useProperty.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useProperty = (slug) => {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) setError(error);
      setProperty(data);
      setLoading(false);
    };

    fetchProperty();
  }, [slug]);

  return [property, loading, error];
};
```

**Depois:**
```typescript
// src/hooks/useProperty.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types';

export const useProperty = (slug: string): [Property | null, boolean, Error | null] => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  return [property, loading, error];
};
```

## 🧩 Fase 4: Migrar Componentes Críticos

Prioridade:
1. Componentes de layout (Navigation, Footer)
2. Componentes de propriedade
3. Componentes admin
4. Resto dos componentes

### Exemplo: Converter componente simples

**Antes:**
```javascript
// src/components/PropertyCard.jsx
import { useState } from 'react';

const PropertyCard = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="p-4 border rounded">
      <h3>{property.title}</h3>
      <p className="text-lg font-bold">${property.price}</p>
      <button onClick={() => setIsFavorite(!isFavorite)}>
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

export default PropertyCard;
```

**Depois:**
```typescript
// src/components/PropertyCard.tsx
import { useState, memo } from 'react';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

const PropertyCard = memo<React.FC<PropertyCardProps>>(
  ({ property, onFavoriteChange }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    const handleFavoriteClick = () => {
      const newState = !isFavorite;
      setIsFavorite(newState);
      onFavoriteChange?.(newState);
    };

    return (
      <div className="p-4 border rounded">
        <h3>{property.title}</h3>
        <p className="text-lg font-bold">${property.price}</p>
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>
    );
  }
);

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;
```

## 📋 Checklist de Migração

- [ ] Setup TypeScript completo
- [ ] `src/types/index.ts` criado
- [ ] `src/lib/**/*.ts` migrado
- [ ] `src/hooks/**/*.ts` migrado
- [ ] `src/services/**/*.ts` migrado
- [ ] Componentes críticos `.tsx`
- [ ] Componentes restantes `.tsx`
- [ ] Todos os tipos validados
- [ ] ESLint passa sem errors
- [ ] Testes ainda passam
- [ ] Build sem warnings

## 🔧 Ferramentas Úteis

### Converter JS → TS automaticamente

```bash
# Criar arquivo .ts com tipos básicos
npx ts-migrate migrate --files "src/**/*.jsx"

# Atualizar tipos incrementalmente
npm run type-check -- --watch
```

### Verificar coverage de TypeScript

```bash
# Ver quantos arquivos ainda estão em JS
find src -name "*.js" -o -name "*.jsx" | wc -l

# Ver quantos arquivos estão em TS
find src -name "*.ts" -o -name "*.tsx" | wc -l
```

## ⚠️ Common Pitfalls

### 1. Tipos `any` desnecessários

```typescript
// ❌ RUIM
const handleClick = (e: any) => {};

// ✅ BOM
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {};
```

### 2. Esquecer tipos de props

```typescript
// ❌ RUIM
interface MyComponentProps {}
const MyComponent = (props) => {};

// ✅ BOM
interface MyComponentProps {
  title: string;
  onClick: () => void;
}
const MyComponent: React.FC<MyComponentProps> = ({ title, onClick }) => {};
```

### 3. Não usar types de Supabase

```typescript
// ❌ RUIM
const { data: any, error: any } = await supabase
  .from('properties')
  .select('*');

// ✅ BOM
import type { Property } from '@/types';

const { data, error } = await supabase
  .from('properties')
  .select('*')
  .returns<Property[]>();
```

## 📚 Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React with TypeScript](https://react.dev/learn/typescript)
- [Migration Guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)

---

**Meta:** 100% TypeScript em 3-6 meses

