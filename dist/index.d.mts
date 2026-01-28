import { ApolloLink, Operation, NextLink, FetchResult, ReactiveVar, ApolloClient } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { ReactNode, FC, ComponentType, AnchorHTMLAttributes } from 'react';

interface Route$1 {
    pathname: string;
    params: Record<string, string>;
    query: Record<string, string>;
    hash?: string;
    state?: any;
}
interface RouteConfig {
    path: string;
    component?: any;
    loader?: (params: Record<string, string>) => Promise<any>;
}
interface RoutingLinkOptions {
    routes?: RouteConfig[];
    onNavigate?: (route: Route$1) => void;
    syncWithHistory?: boolean;
    basename?: string;
}
interface RouteObject {
    path: string;
    element?: ReactNode;
    children?: RouteObject[];
    loader?: (params: Record<string, string>) => Promise<any>;
    index?: boolean;
}
interface RouteMatch {
    route: RouteObject;
    pathname: string;
    params: Record<string, string>;
}

declare class RoutingLink extends ApolloLink {
    private options;
    constructor(options?: RoutingLinkOptions);
    private setupHistoryListener;
    private parseCurrentLocation;
    private updateBrowserHistory;
    request(operation: Operation, forward: NextLink): Observable<FetchResult>;
}
declare function createRoutingLink(options?: RoutingLinkOptions): RoutingLink;

declare const routeVar: ReactiveVar<Route$1>;
declare function getCacheConfig(): {
    typePolicies: {
        Query: {
            fields: {
                route: {
                    read(): Route$1;
                };
            };
        };
    };
};

interface RouteProps {
    path: string;
    component?: ComponentType<any>;
    children?: ReactNode | ((params: Record<string, string>) => ReactNode);
    exact?: boolean;
}
declare const Route: FC<RouteProps>;

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    to: string;
    replace?: boolean;
    state?: any;
    prefetch?: boolean;
}
declare const Link: FC<LinkProps>;

interface RoutesProps {
    children?: ReactNode;
    routes?: RouteObject[];
}
declare const Routes: FC<RoutesProps>;

interface OutletProps {
    context?: any;
}
declare const Outlet: FC<OutletProps>;

declare function useRoute(): Route$1;

declare function useNavigate(): {
    navigate: (pathname: string, options?: {
        params?: Record<string, string>;
        query?: Record<string, string>;
        hash?: string;
        state?: any;
        replace?: boolean;
    }) => void;
    back: () => void;
    forward: () => void;
};

declare function useParams(): Record<string, string>;

declare function useScrollRestoration(): void;

declare function useSearchParams(): Record<string, string>;

declare function useMatches(): RouteMatch[];

declare function useParentRoute(): {
    pathname: string;
    params: Record<string, string>;
} | null;

interface RouteLoader {
    path: string;
    loader: (client: ApolloClient, params: Record<string, string>) => Promise<any>;
}
declare const registerLoader: (path: string, loader: RouteLoader["loader"]) => void;
declare const prefetchRoute: (client: ApolloClient, path: string, params?: Record<string, string>, loader?: RouteLoader["loader"]) => Promise<any>;
declare const clearPrefetchCache: (path?: string) => void;
declare const clearLoaderRegistry: () => void;

export { Link, Outlet, Route, type RouteConfig, type RouteMatch, type RouteObject, type Route$1 as RouteType, Routes, RoutingLink, type RoutingLinkOptions, clearLoaderRegistry, clearPrefetchCache, createRoutingLink, getCacheConfig, prefetchRoute, registerLoader, routeVar, useMatches, useNavigate, useParams, useParentRoute, useRoute, useScrollRestoration, useSearchParams };
