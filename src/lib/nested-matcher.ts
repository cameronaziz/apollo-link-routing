import { RouteObject, RouteMatch } from '../types';
import { matchPath } from './matcher';

export function matchRoutes(
  routes: RouteObject[],
  pathname: string,
  parentPath: string = ''
): RouteMatch[] | null {
  for (const route of routes) {
    const fullPath = joinPaths(parentPath, route.path);
    const match = matchPath(fullPath, pathname);

    if (match) {
      const routeMatch: RouteMatch = {
        route,
        pathname: fullPath,
        params: match.params,
      };

      // If this route has children, try to match them
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

export function joinPaths(...paths: string[]): string {
  return paths
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
}