// src/RoutingLink.ts
import { ApolloLink } from "@apollo/client";
import { Observable } from "@apollo/client/utilities";

// src/utils/cache.ts
import { makeVar } from "@apollo/client";
var routeVar = makeVar({
  pathname: typeof window !== "undefined" ? window.location.pathname : "/",
  params: {},
  query: {},
  hash: typeof window !== "undefined" ? window.location.hash : ""
});
function getCacheConfig() {
  return {
    typePolicies: {
      Query: {
        fields: {
          route: {
            read() {
              return routeVar();
            }
          }
        }
      }
    }
  };
}

// src/lib/matcher.ts
function matchPath(pattern, pathname) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  const params = {};
  let patternIndex = 0;
  let pathIndex = 0;
  while (patternIndex < patternParts.length || pathIndex < pathParts.length) {
    const patternPart = patternParts[patternIndex];
    const pathPart = pathParts[pathIndex];
    if (patternPart === "**") {
      params["*"] = pathParts.slice(pathIndex).join("/");
      return { params, path: pattern };
    }
    if (patternPart === "*") {
      if (pathPart === void 0) {
        return null;
      }
      patternIndex++;
      pathIndex++;
      continue;
    }
    if (patternPart?.startsWith(":") && patternPart.endsWith("?")) {
      const paramName = patternPart.slice(1, -1);
      if (pathPart !== void 0) {
        params[paramName] = pathPart;
        pathIndex++;
      }
      patternIndex++;
      continue;
    }
    if (patternPart?.startsWith(":")) {
      if (pathPart === void 0) {
        return null;
      }
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
      patternIndex++;
      pathIndex++;
      continue;
    }
    if (patternPart === pathPart) {
      patternIndex++;
      pathIndex++;
      continue;
    }
    return null;
  }
  return { params, path: pattern };
}
function parseQueryString(search) {
  const params = new URLSearchParams(search);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// src/RoutingLink.ts
var RoutingLink = class extends ApolloLink {
  constructor(options = {}) {
    super();
    this.options = {
      syncWithHistory: true,
      basename: "",
      ...options
    };
    if (typeof window !== "undefined" && this.options.syncWithHistory) {
      this.setupHistoryListener();
    }
  }
  setupHistoryListener() {
    const handlePopState = () => {
      const route = this.parseCurrentLocation();
      routeVar(route);
      this.options.onNavigate?.(route);
    };
    window.addEventListener("popstate", handlePopState);
  }
  parseCurrentLocation() {
    const { pathname, search, hash } = window.location;
    const cleanPathname = pathname.replace(this.options.basename || "", "") || "/";
    return {
      pathname: cleanPathname,
      params: {},
      query: parseQueryString(search),
      hash: hash.slice(1)
    };
  }
  updateBrowserHistory(route, replace = false) {
    if (typeof window === "undefined" || !this.options.syncWithHistory) {
      return;
    }
    const fullPath = `${this.options.basename || ""}${route.pathname}`;
    const query = new URLSearchParams(route.query).toString();
    const hash = route.hash ? `#${route.hash}` : "";
    const url = `${fullPath}${query ? `?${query}` : ""}${hash}`;
    if (replace) {
      window.history.replaceState(route.state, "", url);
    } else {
      window.history.pushState(route.state, "", url);
    }
  }
  request(operation, forward) {
    const context = operation.getContext();
    if (context.route) {
      return new Observable((observer) => {
        const { pathname, params = {}, query = {}, hash, state, replace } = context.route;
        let matchedParams = params;
        if (this.options.routes) {
          for (const routeConfig of this.options.routes) {
            const match = matchPath(routeConfig.path, pathname);
            if (match) {
              matchedParams = { ...match.params, ...params };
              break;
            }
          }
        }
        const newRoute = {
          pathname,
          params: matchedParams,
          query,
          hash,
          state
        };
        routeVar(newRoute);
        this.updateBrowserHistory(newRoute, replace);
        this.options.onNavigate?.(newRoute);
        observer.next({ data: { route: newRoute } });
        observer.complete();
      });
    }
    return forward(operation);
  }
};
function createRoutingLink(options) {
  return new RoutingLink(options);
}

// src/hooks/useRoute.ts
import { useReactiveVar } from "@apollo/client/react";
function useRoute() {
  return useReactiveVar(routeVar);
}

// src/components/Route.tsx
import { Fragment, jsx } from "react/jsx-runtime";
var Route = (props) => {
  const { path, component: Component, children, exact = false } = props;
  const route = useRoute();
  const match = exact ? route.pathname === path ? { params: {}, path } : null : matchPath(path, route.pathname);
  if (!match) return null;
  if (Component) {
    return /* @__PURE__ */ jsx(Component, { params: match.params });
  }
  if (typeof children === "function") {
    return children(match.params);
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
};

// src/hooks/useNavigate.ts
import { useCallback } from "react";
function useNavigate() {
  const navigate = useCallback((pathname, options) => {
    const route = {
      pathname,
      params: options?.params || {},
      query: options?.query || {},
      hash: options?.hash,
      state: options?.state
    };
    routeVar(route);
    if (typeof window !== "undefined") {
      const query = new URLSearchParams(route.query).toString();
      const hash = route.hash ? `#${route.hash}` : "";
      const url = `${pathname}${query ? `?${query}` : ""}${hash}`;
      if (options?.replace) {
        window.history.replaceState(route.state, "", url);
      } else {
        window.history.pushState(route.state, "", url);
      }
    }
  }, []);
  const back = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  }, []);
  const forward = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.forward();
    }
  }, []);
  return { navigate, back, forward };
}

// src/components/Link.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var Link = (props) => {
  const {
    to,
    replace,
    state,
    prefetch,
    onClick,
    children,
    ...rest
  } = props;
  const { navigate } = useNavigate();
  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    navigate(to, { replace, state });
    onClick?.(e);
  };
  return /* @__PURE__ */ jsx2(
    "a",
    {
      href: to,
      onClick: handleClick,
      ...rest,
      children
    }
  );
};

// src/components/Router.tsx
import { useMemo } from "react";

// src/lib/nested-matcher.ts
function matchRoutes(routes, pathname, parentPath = "") {
  for (const route of routes) {
    const fullPath = joinPaths(parentPath, route.path);
    const match = matchPath(fullPath, pathname);
    if (match) {
      const routeMatch = {
        route,
        pathname: fullPath,
        params: match.params
      };
      if (route.children) {
        const childMatches = matchRoutes(route.children, pathname, fullPath);
        if (childMatches) {
          return [routeMatch, ...childMatches];
        }
      }
      return [routeMatch];
    }
  }
  return null;
}
function joinPaths(...paths) {
  return paths.join("/").replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

// src/components/Outlet.tsx
import { createContext, useContext } from "react";
import { jsx as jsx3 } from "react/jsx-runtime";
var OutletContext = createContext(null);
var OutletProvider = (props) => {
  const {
    matches,
    outlet,
    contextData
  } = props;
  return /* @__PURE__ */ jsx3(OutletContext.Provider, { value: { matches, outlet, contextData }, children: outlet });
};
var Outlet = (props) => {
  const { context } = props;
  const parentContext = useContext(OutletContext);
  if (!parentContext) {
    throw new Error("Outlet must be used within a Router component");
  }
  const mergedContext = {
    ...parentContext,
    contextData: context ?? parentContext.contextData
  };
  return /* @__PURE__ */ jsx3(OutletContext.Provider, { value: mergedContext, children: parentContext.outlet });
};

// src/components/Router.tsx
import { Fragment as Fragment2, jsx as jsx4 } from "react/jsx-runtime";
var Router = (props) => {
  const { routes } = props;
  const route = useRoute();
  const matches = useMemo(() => {
    if (!routes) {
      return null;
    }
    return matchRoutes(routes, route.pathname);
  }, [routes, route.pathname]);
  const renderedMatches = useMemo(() => matches?.reduceRight((outlet, match, index) => {
    const element = match.route.element;
    return /* @__PURE__ */ jsx4(
      OutletProvider,
      {
        matches: matches.slice(0, index + 1),
        outlet: element || outlet,
        contextData: match.route
      }
    );
  }, null), [matches]);
  if (!matches || matches.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsx4(Fragment2, { children: renderedMatches });
};

// src/hooks/useParams.ts
function useParams() {
  const route = useRoute();
  return route.params;
}

// src/hooks/useScrollRestoration.ts
import { useEffect } from "react";

// src/lib/ScrollManager.ts
var ScrollRestorationManager = class {
  constructor() {
    this.scrollPositions = /* @__PURE__ */ new Map();
  }
  savePosition(key, position) {
    this.scrollPositions.set(key, position);
  }
  getPosition(key) {
    return this.scrollPositions.get(key);
  }
  clearPosition(key) {
    this.scrollPositions.delete(key);
  }
  clearAll() {
    this.scrollPositions.clear();
  }
};
var scrollManager = new ScrollRestorationManager();

// src/hooks/useScrollRestoration.ts
function useScrollRestoration() {
  const route = useRoute();
  useEffect(() => {
    const key = route.pathname;
    const savedPosition = scrollManager.getPosition(key);
    if (savedPosition !== void 0) {
      window.scrollTo(0, savedPosition);
    } else {
      window.scrollTo(0, 0);
    }
    const saveScrollPosition = () => {
      scrollManager.savePosition(key, window.scrollY);
    };
    window.addEventListener("beforeunload", saveScrollPosition);
    return () => {
      saveScrollPosition();
      window.removeEventListener("beforeunload", saveScrollPosition);
    };
  }, [route.pathname]);
}

// src/hooks/useSearchParams.ts
function useSearchParams() {
  const route = useRoute();
  return route.query;
}

// src/hooks/useMatches.ts
import { useContext as useContext2 } from "react";
function useMatches() {
  const context = useContext2(OutletContext);
  return context?.matches || [];
}

// src/hooks/useParentRoute.ts
import { useContext as useContext3 } from "react";
function useParentRoute() {
  const context = useContext3(OutletContext);
  if (!context) {
    return null;
  }
  return {
    pathname: context.matches[context.matches.length - 2]?.pathname ?? "",
    params: context.matches[context.matches.length - 2]?.params ?? {}
  };
}

// src/lib/PrefetchManager.ts
var PrefetchManager = class {
  constructor() {
    this.loaderCache = /* @__PURE__ */ new Map();
    this.loaderRegistry = /* @__PURE__ */ new Map();
  }
  registerLoader(path, loader) {
    this.loaderRegistry.set(path, loader);
  }
  async prefetch(client, path, params = {}, loader) {
    const cacheKey = `${path}-${JSON.stringify(params)}`;
    if (this.loaderCache.has(cacheKey)) {
      return this.loaderCache.get(cacheKey);
    }
    const loaderFn = loader || this.loaderRegistry.get(path);
    if (loaderFn) {
      const promise = loaderFn(client, params);
      this.loaderCache.set(cacheKey, promise);
      return promise;
    }
    return Promise.resolve(null);
  }
  clearCache(path) {
    if (path) {
      for (const key of this.loaderCache.keys()) {
        if (key.startsWith(path)) {
          this.loaderCache.delete(key);
        }
      }
    } else {
      this.loaderCache.clear();
    }
  }
  clearRegistry() {
    this.loaderRegistry.clear();
  }
};
var prefetchManager = new PrefetchManager();

// src/utils/prefetch.ts
var registerLoader = (path, loader) => {
  prefetchManager.registerLoader(path, loader);
};
var prefetchRoute = (client, path, params = {}, loader) => {
  return prefetchManager.prefetch(client, path, params, loader);
};
var clearPrefetchCache = (path) => {
  prefetchManager.clearCache(path);
};
var clearLoaderRegistry = () => {
  prefetchManager.clearRegistry();
};
export {
  Link,
  Outlet,
  Route,
  Router,
  RoutingLink,
  clearLoaderRegistry,
  clearPrefetchCache,
  createRoutingLink,
  getCacheConfig,
  prefetchRoute,
  registerLoader,
  routeVar,
  useMatches,
  useNavigate,
  useParams,
  useParentRoute,
  useRoute,
  useScrollRestoration,
  useSearchParams
};
