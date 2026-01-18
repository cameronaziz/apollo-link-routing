import {useCallback} from "react";
import {Route} from "../types";
import {routeVar} from "../utils/cache";

export function useNavigate() {
  const navigate = useCallback((
    pathname: string,
    options?: {
      params?: Record<string, string>;
      query?: Record<string, string>;
      hash?: string;
      state?: any;
      replace?: boolean;
    }
  ) => {
    const route: Route = {
      pathname,
      params: options?.params || {},
      query: options?.query || {},
      hash: options?.hash,
      state: options?.state,
    };

    routeVar(route);

    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(route.query).toString();
      const hash = route.hash ? `#${route.hash}` : '';
      const url = `${pathname}${query ? `?${query}` : ''}${hash}`;

      if (options?.replace) {
        window.history.replaceState(route.state, '', url);
      } else {
        window.history.pushState(route.state, '', url);
      }
    }
  }, []);

  const back = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  const forward = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }, []);

  return {navigate, back, forward};
}