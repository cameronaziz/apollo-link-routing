# apollo-link-routing

> Because who says routing can't live in your Apollo Cache? 🚀

A lightweight routing library that manages your app's routing state through Apollo Client's reactive cache. No external router needed—just hooks, components, and Apollo magic.

## 🥂 Pregame

```bash
pnpm add apollo-link-routing
# or npm/yarn, we don't judge
```

## 🕹️ The Setup

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

### 🌹 Matches

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

#### `<Route>` - Finding Your Match

Matches the current pathname against a path pattern and renders if there's chemistry. It's like swiping through URLs—if your path pattern likes the pathname, it's a match! 💕

**Props:**
- `path: string` - Path pattern to match (e.g., `/users/:id`, `/posts/:slug?`)
- `component?: ComponentType<any>` - React component to render if matched. Receives `params` prop
- `children?: ReactNode | ((params: Record<string, string>) => ReactNode)` - Static or function children. Function receives extracted URL params
- `exact?: boolean` - If true, requires exact pathname match. Default: false (pattern matching)

**Examples:**

```tsx
import { Route } from 'apollo-link-routing';

// Swipe right on a profile
<Route path="/users/:id" component={UserProfile} />

// It's a match! Extract their info
<Route path="/posts/:slug">
  {({ slug }) => <Post slug={slug} />}
</Route>

// Show your "About Me"
<Route path="/about">
  <About />
</Route>

// Only match the home page (no partial matches here)
<Route path="/" exact component={Home} />
```

#### `<Router>` - Your Dating Profile

Your app's matchmaking system. Hand it a list of routes and let it find "the one" based on the current URL.

```tsx
import { Router, Route, Link, Outlet } from 'apollo-link-routing';

function App() {
  return (
    <Router routes={[
      {
        path: '/',
        element: <Home />, // Your main squeeze
      },
      {
        path: '/users/:id',
        element: <User />,
        loader: async (params) => {
          // Pre-load their profile before you swipe (no catfishing here)
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
        <Link to="/about/team">Meet the Team</Link> {/* Swipe right to learn more */}
      </nav>
      <Outlet /> {/* This is where the magic happens 💕 */}
    </div>
  );
}
```

#### Why No Switch Component?

Unlike some routers, we don't provide a `Switch` component for stacking route declarations. Here's why:

**Better approach: Use `Router` for your main structure**

```tsx
// ✅ Recommended: Router + route config objects
<Router routes={[
  { path: '/', element: <Home /> },
  { path: '/users/:id', element: <User /> },
  { path: '/about', element: <About /> },
]} />
```

**Why this beats a Switch pattern:**
1. **Single pass matching** - One efficient path analysis instead of checking each Route sequentially
2. **Loader support** - Data prefetching works across your entire route tree
3. **Nested routes** - Built-in support for layouts and `<Outlet />`
4. **Better DX** - Route configuration is declarative and colocated
5. **First-match wins** - Route priority is explicit, not implicit

**When to use standalone `Route` components:**
For conditional rendering *within* routes, not for your main routing structure.

```tsx
// ✅ OK: Conditional rendering inside a route
function Dashboard() {
  const user = useUser();

  return (
    <div>
      <Route path="/admin" exact component={AdminPanel} />
      {user && <Route path="/profile">{/* Profile UI */}</Route>}
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