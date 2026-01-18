import {ApolloClient} from '@apollo/client';
import {prefetchManager} from "../lib/PrefetchManager";

export interface RouteLoader {
  path: string;
  loader: (client: ApolloClient, params: Record<string, string>) => Promise<any>;
}

export const registerLoader = (path: string, loader: RouteLoader['loader']) => {
  prefetchManager.registerLoader(path, loader);
};

export const prefetchRoute = (
  client: ApolloClient,
  path: string,
  params: Record<string, string> = {},
  loader?: RouteLoader['loader']
) => {
  return prefetchManager.prefetch(client, path, params, loader);
};

export const clearPrefetchCache = (path?: string) => {
  prefetchManager.clearCache(path);
};

export const clearLoaderRegistry = () => {
  prefetchManager.clearRegistry();
};