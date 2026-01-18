import { ApolloLink, Operation, NextLink, FetchResult } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { routeVar } from './utils/cache';
import { matchPath, parseQueryString } from './lib/matcher';
import type { RoutingLinkOptions, Route } from './types';

export class RoutingLink extends ApolloLink {
  private options: RoutingLinkOptions;

  constructor(options: RoutingLinkOptions = {}) {
    super();
    this.options = {
      syncWithHistory: true,
      basename: '',
      ...options,
    };

    if (typeof window !== 'undefined' && this.options.syncWithHistory) {
      this.setupHistoryListener();
    }
  }

  private setupHistoryListener() {
    const handlePopState = () => {
      const route = this.parseCurrentLocation();
      routeVar(route);
      this.options.onNavigate?.(route);
    };

    window.addEventListener('popstate', handlePopState);
  }

  private parseCurrentLocation(): Route {
    const { pathname, search, hash } = window.location;
    const cleanPathname = pathname.replace(this.options.basename || '', '') || '/';

    return {
      pathname: cleanPathname,
      params: {},
      query: parseQueryString(search),
      hash: hash.slice(1),
    };
  }

  private updateBrowserHistory(route: Route, replace: boolean = false) {
    if (typeof window === 'undefined' || !this.options.syncWithHistory) {
      return;
    }

    const fullPath = `${this.options.basename || ''}${route.pathname}`;
    const query = new URLSearchParams(route.query).toString();
    const hash = route.hash ? `#${route.hash}` : '';
    const url = `${fullPath}${query ? `?${query}` : ''}${hash}`;

    if (replace) {
      window.history.replaceState(route.state, '', url);
    } else {
      window.history.pushState(route.state, '', url);
    }
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> {
    const context = operation.getContext();

    // Check if this operation has routing directives
    if (context.route) {
      return new Observable((observer) => {
        const { pathname, params = {}, query = {}, hash, state, replace } = context.route;

        // Match against configured routes to extract params
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

        const newRoute: Route = {
          pathname,
          params: matchedParams,
          query,
          hash,
          state,
        };

        // Update cache
        routeVar(newRoute);

        // Update browser history
        this.updateBrowserHistory(newRoute, replace);

        // Call onNavigate callback
        this.options.onNavigate?.(newRoute);

        // Complete the observable
        observer.next({ data: { route: newRoute } });
        observer.complete();
      });
    }

    // Not a routing operation, forward to next link
    return forward(operation);
  }
}

export function createRoutingLink(options?: RoutingLinkOptions) {
  return new RoutingLink(options);
}