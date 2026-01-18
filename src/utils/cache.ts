import { makeVar, ReactiveVar } from '@apollo/client';
import type { Route } from '../types';

export const routeVar: ReactiveVar<Route> = makeVar<Route>({
  pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
  params: {},
  query: {},
  hash: typeof window !== 'undefined' ? window.location.hash : '',
});

export function getCacheConfig() {
  return {
    typePolicies: {
      Query: {
        fields: {
          route: {
            read() {
              return routeVar();
            },
          },
        },
      },
    },
  };
}