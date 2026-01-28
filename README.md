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

### 🌹 It's a Match! (Matching Algorithms)

Our matchmaking finds your perfect routing soulmate:

- **Dynamic params**: `/users/:id` → `{ id: "123" }` (find them by ID)
- **Optional params**: `/posts/:slug?` → matches `/posts` AND `/posts/hello` (flexible)
- **Wildcards**: `/files/*` → matches any single segment (one degree of freedom)
- **Catch-all**: `/docs/**` → matches everything under `/docs` (all the feels)

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

Unlike some routers, we don't provide a `Switch` component for stacking route declarations. That's like swiping through profiles one by one—inefficient and you might miss your perfect match!

**Better approach: Use `Router` for your main structure**

```tsx
// ✅ Recommended: Router + route config objects (the smart matchmaking algorithm)
<Router routes={[
  { path: '/', element: <Home /> },
  { path: '/users/:id', element: <User /> },
  { path: '/about', element: <About /> },
]} />
```

**Why this beats a Switch pattern:**
1. **Single swipe** - One efficient match check instead of swiping through each Route
2. **Pre-load profiles** - Data prefetching works across your entire route tree (no surprises)
3. **Deep connections** - Built-in support for nested routes and layouts with `<Outlet />`
4. **Better vibes** - Route configuration is declarative and colocated
5. **Chemistry first** - Route priority is explicit, not a guessing game

**When to use standalone `Route` components:**
For conditional matching *within* routes—like deciding whether to show a premium feature if they're verified.

```tsx
// ✅ OK: Extra matching inside a route
function Dashboard() {
  const user = useUser();

  return (
    <div>
      <Route path="/admin" exact component={AdminPanel} />
      {user?.isVerified && <Route path="/profile">{/* Verified badge 💎 */}</Route>}
    </div>
  );
}
```

### ⚡ Prefetching (Pre-load the goods)

Load their profile before you swipe, no awkward "loading..." states.

```tsx
import { registerLoader, prefetchRoute } from 'apollo-link-routing';

// "Slide into their DMs" - register a loader for a route
registerLoader('/users/:id', async (client, params) => {
  return client.query({
    query: GET_USER,
    variables: { id: params.id },
  });
});

// Prefetch their profile before they click (smooth moves)
await prefetchRoute(client, '/users/123');
```

### 🧭 Navigation (Making Your Move)

```tsx
const { navigate, back, forward } = useNavigate();

// Swipe right on someone specific
navigate('/users/123');

// Find your people (with filters)
navigate('/search', {
  query: { q: 'apollo' }, // search query
  hash: 'results', // jump to section
  state: { from: 'home' }, // remember where you came from
  replace: true, // Don't add to history (cover your tracks 😏)
});
```

### 📜 Scroll Restoration (Remember Where You Were)

Never lose your spot in the lineup. Remember exactly where you were swiping before you left.

```tsx
import { useScrollRestoration } from 'apollo-link-routing';

function Page() {
  useScrollRestoration('my-profile-key');
  return <div>Come back and pick up where you left off 💋</div>;
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

## Why Though? (Why We're Better)

1. **One profile** - Your routing state lives where your data lives (no catfishing)
2. **Real-time vibes** - Routes are reactive, updates are instant (swipe faster ⚡)
3. **Works anywhere** - SSR friendly, handles `window` checks for you
4. **Type-safe** - Full TypeScript support (no catcalling without type hints)
5. **Lightweight** - No massive router dependency dragging you down

## License

MIT - Go wild! 🎉