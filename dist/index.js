"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Link: () => Link,
  Outlet: () => Outlet,
  Route: () => Route,
  Router: () => Router,
  RoutingLink: () => RoutingLink,
  clearLoaderRegistry: () => clearLoaderRegistry,
  clearPrefetchCache: () => clearPrefetchCache,
  createRoutingLink: () => createRoutingLink,
  getCacheConfig: () => getCacheConfig,
  prefetchRoute: () => prefetchRoute,
  registerLoader: () => registerLoader,
  routeVar: () => routeVar,
  useMatches: () => useMatches,
  useNavigator: () => useNavigator,
  useParams: () => useParams,
  useParentRoute: () => useParentRoute,
  useRoute: () => useRoute,
  useScrollRestoration: () => useScrollRestoration,
  useSearchParams: () => useSearchParams
});
module.exports = __toCommonJS(index_exports);

// src/RoutingLink.ts
var import_client2 = require("@apollo/client");
var import_utilities = require("@apollo/client/utilities");

// src/utils/cache.ts
var import_client = require("@apollo/client");
var routeVar = (0, import_client.makeVar)({
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
var RoutingLink = class extends import_client2.ApolloLink {
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
      return new import_utilities.Observable((observer) => {
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
var import_react = require("@apollo/client/react");
function useRoute() {
  return (0, import_react.useReactiveVar)(routeVar);
}

// src/components/Route.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var Route = (props) => {
  const { path, component: Component, children, exact = false } = props;
  const route = useRoute();
  const match = exact ? route.pathname === path ? { params: {}, path } : null : matchPath(path, route.pathname);
  if (!match) return null;
  if (Component) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Component, { params: match.params });
  }
  if (typeof children === "function") {
    return children(match.params);
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
};

// src/hooks/useNavigator.ts
var import_react2 = require("react");
var useNavigator = () => {
  const routeTo = (0, import_react2.useCallback)((pathname, options) => {
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
  const back = (0, import_react2.useCallback)(() => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  }, []);
  const forward = (0, import_react2.useCallback)(() => {
    if (typeof window !== "undefined") {
      window.history.forward();
    }
  }, []);
  return { routeTo, back, forward };
};

// src/components/Link.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  const { routeTo } = useNavigator();
  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    routeTo(to, { replace, state });
    onClick?.(e);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
var import_react4 = require("react");

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
    if (route.children && isPathPrefix(fullPath, pathname)) {
      const childMatches = matchRoutes(route.children, pathname, fullPath);
      if (childMatches) {
        const routeMatch = {
          route,
          pathname: fullPath,
          params: {}
        };
        return [routeMatch, ...childMatches];
      }
    }
  }
  return null;
}
function isPathPrefix(prefix, pathname) {
  if (prefix === "/") return true;
  return pathname === prefix || pathname.startsWith(prefix + "/");
}
function joinPaths(...paths) {
  return paths.join("/").replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

// src/components/Outlet.tsx
var import_react3 = require("react");
var import_jsx_runtime3 = require("react/jsx-runtime");
var OutletContext = (0, import_react3.createContext)(null);
var OutletProvider = (props) => {
  const {
    matches,
    outlet,
    contextData,
    children
  } = props;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(OutletContext.Provider, { value: { matches, outlet, contextData }, children: children !== void 0 ? children : outlet });
};
var Outlet = (props) => {
  const { context } = props;
  const parentContext = (0, import_react3.useContext)(OutletContext);
  if (!parentContext) {
    throw new Error("Outlet must be used within a Router component");
  }
  const mergedContext = {
    ...parentContext,
    contextData: context ?? parentContext.contextData
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(OutletContext.Provider, { value: mergedContext, children: parentContext.outlet });
};

// src/components/Router.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var Router = (props) => {
  const { routes } = props;
  const route = useRoute();
  const matches = (0, import_react4.useMemo)(() => {
    if (!routes) {
      return null;
    }
    return matchRoutes(routes, route.pathname);
  }, [routes, route.pathname]);
  const renderedMatches = (0, import_react4.useMemo)(() => matches?.reduceRight((outlet, match, index) => {
    const element = match.route.element;
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      OutletProvider,
      {
        matches: matches.slice(0, index + 1),
        outlet: element ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(OutletProvider, { matches: matches.slice(0, index + 1), outlet, contextData: match.route, children: element }) : outlet,
        contextData: match.route
      }
    );
  }, null), [matches]);
  if (!matches || matches.length === 0) {
    return null;
  }
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_jsx_runtime4.Fragment, { children: renderedMatches });
};

// src/hooks/useParams.ts
function useParams() {
  const route = useRoute();
  return route.params;
}

// src/hooks/useScrollRestoration.ts
var import_react5 = require("react");

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
  (0, import_react5.useEffect)(() => {
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
var import_react6 = require("react");
function useMatches() {
  const context = (0, import_react6.useContext)(OutletContext);
  return context?.matches || [];
}

// src/hooks/useParentRoute.ts
var import_react7 = require("react");
function useParentRoute() {
  const context = (0, import_react7.useContext)(OutletContext);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
  useNavigator,
  useParams,
  useParentRoute,
  useRoute,
  useScrollRestoration,
  useSearchParams
});
