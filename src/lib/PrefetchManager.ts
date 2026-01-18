import {ApolloClient} from "@apollo/client";
import {RouteLoader} from "../utils/prefetch";

class PrefetchManager {
  private loaderCache = new Map<string, Promise<any>>();
  private loaderRegistry = new Map<string, RouteLoader['loader']>();

  registerLoader(path: string, loader: RouteLoader['loader']) {
    this.loaderRegistry.set(path, loader);
  }

  async prefetch(
    client: ApolloClient,
    path: string,
    params: Record<string, string> = {},
    loader?: RouteLoader['loader']
  ) {
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

  clearCache(path?: string) {
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
}

export const prefetchManager = new PrefetchManager();
