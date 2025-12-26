<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md - AI Agent Guide for E-commerce Platform

## Project Overview

**e-commerce-dashboard** is a comprehensive e-commerce admin dashboard built with React.

### Architecture

- **Frontend**: React 19 + TypeScript + Vite + shadcn/ui v4
- **Authentication**: JWT-based auth with RBAC permissions
- **API Documentation**: Swagger/OpenAPI 3.1.0

### Key Technologies

**Frontend Stack:**

- `react: ^18.3.1` - UI library with concurrent features
- `typescript: ^5.8.3` - Type safety with strict configuration
- `vite: ^5.4.19` - Fast build tool with SWC compilation
- `@tanstack/react-query: ^5.83.0` - Server state management and caching
- `react-router-dom: ^6.30.1` - Client-side routing
- `react-hook-form: ^7.61.1` - Form management with validation
- `zod: ^3.25.76` - Schema validation
- `tailwindcss: ^3.4.17` - CSS framework with custom design system
- `shadcn/ui` - Component library (40+ components) with Radix UI primitives

## Project Structure

```
e-commerce-dashboard/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── common/        # Shared utility components
│   │   │   ├── dashboard/     # Dashboard-specific components
│   │   │   └── product-editor/ # Product management components
│   │   ├── pages/              # Page components
│   │   │   ├── admin/         # Admin panel pages
│   │   │   ├── Login.tsx      # Authentication
│   │   │   └── NotFound.tsx   # 404 page
│   │   ├── hooks/              # Custom React hooks
│   │   ├── contexts/           # React contexts
│   │   ├── lib/                # Utility functions
│   │   ├── layouts/            # Layout components
│   │   └── providers/          # Context providers
│   ├── public/                 # Static assets
│   ├── package.json            # Dependencies and scripts
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.ts      # Tailwind CSS configuration
│   └── tsconfig.json           # TypeScript configuration
```

## Frontend Architecture & Patterns

### Modern React Stack

The dashboard frontend uses a modern React 18+ stack with TypeScript, built on Vite for fast development and optimized production builds.

**Core Technologies:**

- **React 18.3.1**: Utilizes concurrent features, automatic batching, and Suspense
- **TypeScript 5.8.3**: Strict type checking with relaxed rules for rapid development
- **Vite 5.4.19**: Lightning-fast HMR with SWC compilation for React
- **Tailwind CSS 3.4.17**: Utility-first CSS framework with custom design system

**UI Component Architecture:**

- **Radix UI Primitives**: Headless components for accessibility and behavior
- **shadcn/ui**: Custom-styled component library with 40+ components
- **Lucide React**: Modern icon library with consistent design
- **Ant Design**: Additional UI components for complex data display needs
- **Recharts**: Chart library for data visualization

### State Management Strategy

**Server State Management:**

```typescript
// React Query for API data management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      retry: 1,
    },
  },
});

// Standard data fetching pattern
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => apiClient.get("/admin/products", { params: filters }),
    select: (response) => response.data,
  });
};
```

**Client State Management:**

```typescript
// Custom hooks for UI state
export const useAuthStore = create((set) => ({
  admin: null,
  loading: true,
  setAuth: (auth) => set({ admin: auth, loading: false }),
  logout: () => set({ admin: null, loading: false }),
}));
```

**Form State Management:**

```typescript
// React Hook Form with Zod validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().optional(),
});

const form = useForm({
  resolver: zodResolver(productSchema),
  defaultValues: { name: "", price: 0, category: "" },
});
```

### Component Architecture

**UI Component Structure:**

```
src/components/
├── ui/                     # shadcn/ui components (40+)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   └── ...
├── product-editor/         # Feature-specific components
│   ├── ProductInfoBox.tsx
│   ├── ProductPricingSection.tsx
│   └── ...
├── dashboard/              # Dashboard components
│   ├── DailyOrders.tsx
│   └── DailyRevenue.tsx
└── common/                 # Shared utilities
    ├── DataTable.tsx
    └── WysiwygEditor.tsx
```

**Page Structure:**

```
src/pages/
├── Index.tsx              # Landing page
├── Login.tsx              # Authentication
├── NotFound.tsx           # 404 page
└── admin/                 # Admin panel pages
    ├── Dashboard.tsx      # Main dashboard
    ├── Products.tsx       # Product management
    ├── Orders.tsx         # Order management
    ├── Customers.tsx      # Customer management
    └── ...
```

### Theming and Styling

**Design System:**

- **Custom Color Palette**: HSL-based CSS variables for consistent theming
- **Dark Mode Support**: Built-in theme switching with `next-themes`
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Custom Components**: Extensible component system with consistent styling

**Theme Configuration:**

```typescript
// Tailwind config with custom design tokens
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "hsl(var(--primary))" },
        sidebar: { DEFAULT: "hsl(var(--sidebar-background))" },
      },
      borderRadius: { lg: "var(--radius)" },
    },
  },
};
```

### Routing and Navigation

**React Router Setup:**

```typescript
// Nested routing with authentication guards
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route
    path="/admin"
    element={
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<Dashboard />} />
    <Route path="products" element={<Products />} />
    {/* ... nested admin routes */}
  </Route>
</Routes>
```

**Navigation Components:**

- **Sidebar Navigation**: Collapsible sidebar with role-based menu items
- **Breadcrumb Navigation**: Hierarchical navigation with active state
- **Protected Routes**: Authentication and authorization guards

### Data Fetching Patterns

**API Client Configuration:**

```typescript
// Axios with automatic token refresh
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Query Patterns:**

- **Automatic Refetching**: Stale-while-revalidate strategy
- **Optimistic Updates**: UI updates before server confirmation
- **Pagination**: Infinite scroll and cursor-based pagination
- **Error Handling**: Global error boundaries and retry logic

### Development Workflow

**Build Process:**

- **Development**: `vite dev` with HMR on port 8080
- **Production Build**: `vite build` with tree-shaking and minification
- **Type Checking**: `tsc --noEmit` for strict type validation
- **Linting**: ESLint with TypeScript and React plugins

**Code Quality:**

- **TypeScript**: Strict mode with custom relaxed rules
- **ESLint**: Enforces React best practices and code consistency
- **Hot Module Replacement**: Fast development iteration
- **Path Aliases**: `@/*` for clean imports

### Performance Optimizations

**Code Splitting:**

```typescript
// Lazy loading for better initial load
const ProductEditor = lazy(() => import("./pages/admin/ProductEditor"));

// Suspense boundaries for loading states
<Suspense fallback={<div>Loading...</div>}>
  <ProductEditor />
</Suspense>;
```

**Optimization Strategies:**

- **Component Memoization**: React.memo for expensive components
- **Query Caching**: Intelligent data caching and background refetching
- **Bundle Analysis**: Code splitting and dynamic imports
- **Image Optimization**: Lazy loading for media content

### Internationalization

**i18n Setup:**

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: { en: { translation: {} } },
  lng: "en",
  fallbackLng: "en",
});
```

## Development Workflow

### Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Run development server:**
   ```bash
   npm run dev
   # Development server runs on http://localhost:8080
   ```
3. **Type checking:**
   ```bash
   npm run type-check
   ```
4. **Build for production:**
   ```bash
   npm run build
   ```
5. **Preview production build:**
   ```bash
   npm run preview
   ```

### Component Development

1. **shadcn/ui Component Pattern**:

```typescript
// Base UI component with forwardRef and variant support
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
```

2. **Feature Component Structure**:

```typescript
// Consistent pattern for feature components
interface ProductListProps {
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

const ProductList = ({ onEdit, onDelete }: ProductListProps) => {
  const { data: products, isLoading } = useProducts();

  return <div className="space-y-4">{/* Component implementation */}</div>;
};
```

3. **Form Component Pattern**:

```typescript
// Standardized form handling with validation
const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
    </Form>
  );
};
```


## Building and Running

### Testing Strategy

**Frontend Testing**:
   - Component testing with React Testing Library
   - Integration tests for user flows
   - E2E testing for critical paths

## Common Tasks

### Development Tasks

#### Adding New UI Component

1. **Create Base Component** in `src/components/ui/`:

```typescript
// Follow shadcn/ui patterns
import { cn } from "@/lib/utils";

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("base-styles", className)} ref={ref} {...props} />
    );
  }
);
```

2. **Add Variants** using `class-variance-authority`
3. **Export from index** in the ui components folder
4. **Add TypeScript types** for props

#### Adding New Page

1. **Create Page Component** in `src/pages/admin/`:

```typescript
const NewPage = () => {
  return (
    <div className="container">
      <h1>New Page</h1>
      {/* Page content */}
    </div>
  );
};
```

2. **Add Route** in `src/App.tsx`:

```typescript
<Route path="new-page" element={<NewPage />} />
```

3. **Add Navigation Item** in sidebar if needed

#### Adding API Integration

1. **Define TypeScript Types** in `src/types/api.ts`
2. **Create Custom Hook** in `src/hooks/`:

```typescript
export const useNewResource = (filters?: NewResourceFilters) => {
  return useQuery({
    queryKey: ["new-resource", filters],
    queryFn: () => apiClient.get("/admin/new-resource", { params: filters }),
    select: (response) => response.data,
  });
};
```

3. **Add Mutation Hook** for CUD operations:

```typescript
export const useCreateNewResource = () => {
  return useMutation({
    mutationFn: (data: CreateNewResourceRequest) =>
      apiClient.post("/admin/new-resource", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["new-resource"] });
      toast.success("Resource created successfully");
    },
  });
};
```

### Code Style

- **TypeScript**: Strict mode with comprehensive type definitions
- **Frontend**: ESLint and Prettier configurations

## Documentation

- **OpenApi Document**: See `docs/swagger.yaml`
- **Swagger JSON Document**: See `docs/swagger.json`

## Git Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` code style changes (formatting, missing semi-colons, etc.)
- `refactor:` code refactoring without adding features or fixing bugs
- `test:` adding or updating tests
- `chore:` changes to the build process or auxiliary tools
---

## MCP Tools
- If you are unsure how to do something, use `gh_grep` to search code examples from github.
- If you need chrome to test a website you develop, use `chrome-devtools-mcp` to open it in a new tab.
- `context7` for up to date documentation on third party code
- `sequential thinking` for any decision making

**Note**: This guide should be updated as the project evolves. Always refer to the latest code and documentation for current patterns and practices.
