import {useApolloClient} from "@apollo/client";
import {useCallback} from "react";
import {clearPrefetchCache, prefetchRoute, RouteLoader} from "../utils/prefetch";

export function usePrefetch() {
  const client = useApolloClient();

  const prefetch = useCallback(
    (path: string, params: Record<string, string> = {}, loader?: RouteLoader['loader']) => {
      return prefetchRoute(client, path, params, loader);
    },
    [client]
  );

  const clear = useCallback((path?: string) => {
    clearPrefetchCache(path);
  }, []);

  return {prefetch, clear};
}