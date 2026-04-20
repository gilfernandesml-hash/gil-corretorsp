# Architecture Documentation

## 📐 Visão Geral da Arquitetura

Este documento descreve a arquitetura de alto nível do projeto Gil Corretor SP.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                     (React 18 + Vite)                       │
├──────────────────┬──────────────────┬───────────────────────┤
│   Pages          │   Components     │   Hooks & State       │
│ (lazy loaded)    │  (shadcn/ui)    │  (React + Context)   │
├──────────────────┴──────────────────┴───────────────────────┤
│                    SERVICES LAYER                           │
│ (API calls, business logic, data transformation)            │
├─────────────────────────────────────────────────────────────┤
│                   SUPABASE CLIENT                           │
│   (Auth, Database, Storage, Realtime)                      │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND LAYER                            │
│ (PostgreSQL, Edge Functions, RLS Policies)                 │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Princípios Arquiteturais

1. **Separation of Concerns**: Cada camada tem responsabilidade clara
2. **Type Safety**: TypeScript para prevenir erros em runtime
3. **Performance**: Code splitting, lazy loading, memoization
4. **Testability**: Componentes, hooks e utils são testáveis
5. **Maintainability**: Código limpo, bem documentado, DRY

## 📁 Estrutura de Diretórios

### `src/`

#### `components/`
Componentes React reutilizáveis, organizados por tipo/domínio.

```
components/
├── ui/                    # shadcn/ui (Radix UI wrapped)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...                # 45+ componentes
├── admin/                 # Admin-only components
├── property/              # Relacionados a propriedades
├── home/                  # Seções da homepage
├── Navigation.tsx         # Layout components
├── Footer.tsx
└── ProtectedRoute.tsx     # Auth wrapper
```

**Padrão de Componente:**
```typescript
interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction?: () => void;
}

const Component: React.FC<ComponentProps> = memo(({ prop1, prop2, onAction }) => {
  return <div>{/* ... */}</div>;
});

Component.displayName = 'Component';
export default Component;
```

#### `pages/`
Páginas da aplicação (rotas). Cada página é lazy-loaded (exceto HomePage).

```
pages/
├── HomePage.tsx           # Eager (critical)
├── PropertyListPage.tsx   # Lazy
├── PropertyDetailPage.tsx # Lazy
├── AdminDashboard.tsx     # Lazy
└── ...
```

#### `hooks/`
Custom React hooks para lógica reutilizável.

```
hooks/
├── useAuth.ts            # Auth management
├── useProperty.ts        # Property fetching
├── useFavorites.ts       # Favorites state
├── useLeadTracking.ts    # Analytics
└── ...
```

#### `services/`
Camada de negócios: chamadas API, transformação de dados.

```
services/
├── propertyService.ts    # CRUD properties
├── leadService.ts        # Lead management
├── seoService.ts         # SEO metadata
└── ...
```

#### `lib/`
Utilitários, clientes, helpers.

```
lib/
├── supabase.ts           # Supabase client (ÚNICO!)
├── errorHandler.ts       # Error handling
├── imageOptimization.ts  # Image processing
├── utils.ts              # cn() for className merging
└── ...
```

#### `utils/`
Funções utilitárias puras.

```
utils/
├── analyticsManager.ts   # Analytics events (centralizado)
├── formatters.ts         # formatPrice(), formatDate()
├── validators.ts         # Email, phone, etc
├── generatePropertySchema.ts  # SEO structured data
└── ...
```

#### `context/`
React Context API para state global.

```
context/
└── AuthContext.tsx       # Auth state (usar SupabaseAuthContext)
```

#### `contexts/`
Contextos modernos (versão consolidada).

```
contexts/
└── SupabaseAuthContext.tsx  # Auth with Supabase (usar este!)
```

#### `types/`
Type definitions (adicionar conforme migrate para TypeScript).

```
types/
├── index.ts              # Main exports
├── property.ts           # Property types
├── user.ts              # User types
└── ...
```

## 🔄 Data Flow

### Fluxo de Dados Típico

```
User Action
    ↓
Component
    ↓
Hook (useProperty, useAuth, etc)
    ↓
Service (propertyService.getById)
    ↓
Supabase Client (supabase.from(...).select(...))
    ↓
Backend (PostgreSQL + RLS)
    ↓
Response (com tipos TypeScript)
    ↓
State Update (useState, Context)
    ↓
Re-render Component
```

### Exemplo Prático: Buscar Propriedade

```typescript
// 1. Component
function PropertyDetailPage({ slug }: { slug: string }) {
  const [property, loading, error] = useProperty(slug);
  
  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <PropertyDetail property={property} />;
}

// 2. Hook
export const useProperty = (slug: string) => {
  const [property, setProperty] = useState<Property | null>(null);
  
  useEffect(() => {
    fetchProperty(slug).then(setProperty);
  }, [slug]);
  
  return [property, loading, error];
};

// 3. Service
async function fetchProperty(slug: string) {
  return propertyService.getBySlug(slug);
}

// 4. Service Implementation
const propertyService = {
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data as Property;
  }
};

// 5. Supabase (client definido um único lugar)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

## 🔐 Authentication Flow

```
User clicks Login
    ↓
LoginPage component
    ↓
useAuth hook (from context)
    ↓
AuthContext.login()
    ↓
supabase.auth.signInWithPassword()
    ↓
Backend verifies credentials
    ↓
Returns session + user
    ↓
AuthContext updates state
    ↓
Components re-render
    ↓
Router redirects to dashboard
```

### Protected Routes

```typescript
<ProtectedRoute>
  <AdminDashboard />
</ProtectedRoute>

// ProtectedRoute checks:
// 1. Is user authenticated?
// 2. Does user have required role?
// 3. If no: redirect to login
// 4. If yes: render component
```

## 📊 State Management

### Estratégia

- **Local State**: `useState` para UI state (modals, forms)
- **Context API**: `AuthContext` para global auth state
- **Server State**: Supabase queries com caching

### Evitar

- ❌ Redux (overkill para este projeto)
- ❌ MobX (complexidade desnecessária)
- ❌ Global state para tudo

### Usar

- ✅ useState (local)
- ✅ Context API (auth)
- ✅ Supabase realtime (live data)
- ✅ Custom hooks (data fetching)

## ⚡ Performance Strategies

### Code Splitting

```typescript
// Lazy load pages
const PropertyListPage = lazy(() => import('@/pages/PropertyListPage'));

// With Suspense
<Suspense fallback={<LoadingFallback />}>
  <PropertyListPage />
</Suspense>
```

### Memoization

```typescript
// Memoize components
const PropertyCard = memo(({ property }: Props) => {
  return <div>{/* ... */}</div>;
});

// Memoize callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

### Image Optimization

```typescript
// Use ImageOptimizer component
import ImageOptimizer from '@/components/ImageOptimizer';

<ImageOptimizer
  src="image.jpg"
  alt="Property"
  width={400}
  height={300}
  webp
/>
```

## 🧪 Testing Strategy

### Unit Tests (Jest)

```typescript
// Test utils, hooks, services
describe('propertyService', () => {
  it('should fetch property by slug', async () => {
    const result = await propertyService.getBySlug('apt-in-sp');
    expect(result.slug).toBe('apt-in-sp');
  });
});
```

### Component Tests

```typescript
// Test components with React Testing Library
describe('PropertyCard', () => {
  it('should render property title', () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('Apartamento em SP')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
// Test full user flows
test('should view property details', async ({ page }) => {
  await page.goto('/imovel/apt-in-sp');
  await expect(page.locator('h1')).toContainText('Apartamento em SP');
});
```

## 🛡️ Security

### API Keys
- ✅ `VITE_SUPABASE_URL` - public (safe to expose)
- ✅ `VITE_SUPABASE_ANON_KEY` - anon key (safe to expose)
- ❌ `VITE_SUPABASE_SECRET_KEY` - NEVER expose in frontend

### Row Level Security (RLS)
- Implementado no Supabase
- Garante que usuários só vejam seus dados

### Input Validation
- Validar no frontend (UX)
- Validar no backend (segurança)
- Usar TypeScript types

## 📈 Monitoring

### Analytics
- Google Analytics 4 integrado
- `analyticsManager.ts` centraliza eventos

### Error Tracking
- Pronto para Sentry (ou similar)
- `errorHandler.ts` centraliza erros

### Performance
- Web Vitals integrado
- Lighthouse score monitoring

## 🚀 Deployment

### Build Process

```bash
npm run prebuild    # Generate sitemap
npm run build       # Vite build → dist/
```

### Vercel

1. Deploy automático em push
2. Environment variables configuradas
3. Serverless functions (Edge Functions Supabase)

### Database Migrations

- Usar Supabase migrations
- Versionado no git
- Executar antes de deploy

## 📚 Best Practices

1. **DRY**: Não repita código, use componentes/hooks
2. **SOLID**: Single Responsibility Principle
3. **Composable**: Componentes pequenos e combinados
4. **Testable**: Código testável desde o início
5. **Documented**: JSDoc para funções públicas
6. **Typed**: Use TypeScript (em progresso)

## 🔗 Referências

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

**Última atualização:** 20 de Abril de 2026
