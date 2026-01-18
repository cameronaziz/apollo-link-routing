import type {ReactNode} from "react";

export interface Route {
  pathname: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash?: string;
  state?: any;
}

export interface RouteConfig {
  path: string;
  component?: any;
  loader?: (params: Record<string, string>) => Promise<any>;
}

export interface RoutingLinkOptions {
  routes?: RouteConfig[];
  onNavigate?: (route: Route) => void;
  syncWithHistory?: boolean;
  basename?: string;
}

export interface RouteObject {
  path: string;
  element?: ReactNode;
  children?: RouteObject[];
  loader?: (params: Record<string, string>) => Promise<any>;
  index?: boolean;
}

export interface RouteMatch {
  route: RouteObject;
  pathname: string;
  params: Record<string, string>;
}