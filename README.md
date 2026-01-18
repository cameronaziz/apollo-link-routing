# apollo-link-routing

> Because who says routing can't live in your Apollo Cache? 🚀

A lightweight routing library that manages your app's routing state through Apollo Client's reactive cache. No external router needed—just hooks, components, and Apollo magic.

## Installation

```bash
pnpm add apollo-link-routing
# or npm/yarn, we don't judge
```

## Quick Start

```tsx
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createRoutingLink, getCacheConfig } from 'apollo-link-routing';

const client = new ApolloClient({
  link: createRoutingLink({
    syncWithHistory: true,
    basename: '/app',
  }),
  cache: new InMemoryCache(getCacheConfig()),
});
```

## Features

### 🎯 Path Matching (the fancy kind)

- **Dynamic params**: `/users/:id` → `{ id: "123" }`
- **Optional params**: `/posts/:slug?` → matches `/posts` AND `/posts/hello`
- **Wildcards**: `/files/*` → matches any single segment
- **Catch-all**: `/docs/**` → matches everything under `/docs`

### 🪝 Hooks

```tsx
import {
  useRoute,        // Get current route
  useNavigate,     // Navigate programmatically
  useParams,       // Extract URL params
  useSearchParams, // Query string shenanigans
  useMatches,      // All matched routes (nested)
  useParentRoute,  // For nested route nerds
  useScrollRestoration, // Auto scroll restoration
} from 'apollo-link-routing';

function UserProfile() {
  const { id } = useParams();
  const { navigate } = useNavigate();
  const [search] = useSearchParams();

  return <div>User {id}</div>;
}
```

### 🧩 Components

```tsx
import { Routes, Route, Link, Outlet } from 'apollo-link-routing';

function App() {
  return (
    <Routes routes={[
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/users/:id',
        element: <User />,
        loader: async (params) => {
          // Prefetch data before rendering
          return fetchUser(params.id);
        },
      },
      {
        path: '/about',
        element: <Layout />,
        children: [
          { path: '/about/team', element: <Team /> },
        ],
      },
    ]} />
  );
}

function Layout() {
  return (
    <div>
      <nav>
        <Link to="/about/team">Team</Link>
      </nav>
      <Outlet /> {/* Renders nested routes */}
    </div>
  );
}
```

### ⚡ Prefetching

```tsx
import { registerLoader, prefetchRoute } from 'apollo-link-routing';

// Register a loader for a route
registerLoader('/users/:id', async (client, params) => {
  return client.query({
    query: GET_USER,
    variables: { id: params.id },
  });
});

// Prefetch before navigation
await prefetchRoute(client, '/users/123');
```

### 🧭 Navigation

```tsx
const { navigate, back, forward } = useNavigate();

// Basic navigation
navigate('/users/123');

// With options
navigate('/search', {
  query: { q: 'apollo' },
  hash: 'results',
  state: { from: 'home' },
  replace: true, // Replace instead of push
});
```

### 📜 Scroll Restoration

```tsx
import { useScrollRestoration } from 'apollo-link-routing';

function Page() {
  useScrollRestoration('my-page-key');
  return <div>Scroll position auto-saved! ✨</div>;
}
```

## API Reference

### `createRoutingLink(options)`

Creates the Apollo Link for routing.

**Options:**
- `routes?: RouteConfig[]` - Route configurations with loaders
- `onNavigate?: (route: Route) => void` - Callback on navigation
- `syncWithHistory?: boolean` - Sync with browser history (default: true)
- `basename?: string` - Base path for all routes

### `getCacheConfig()`

Returns Apollo Cache configuration with routing field policy.

### Route Object

```tsx
interface Route {
  pathname: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash?: string;
  state?: any;
}
```

## Why Though?

1. **Single source of truth** - Your routing state lives where your data lives
2. **Reactive** - Routes are reactive variables, updates are instant
3. **SSR friendly** - Handles `window` checks for you
4. **Type-safe** - Full TypeScript support
5. **Tiny** - No massive router dependency

## License

MIT - Go wild! 🎉