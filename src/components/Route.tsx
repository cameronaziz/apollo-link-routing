import {ComponentType, FC, ReactNode} from 'react';
import {matchPath} from '../lib/matcher';
import {useRoute} from "../hooks/useRoute";

interface RouteProps {
  path: string;
  component?: ComponentType<any>;
  children?: ReactNode | ((params: Record<string, string>) => ReactNode);
  exact?: boolean;
}

export const Route: FC<RouteProps> = (props) => {
  const {path, component: Component, children, exact = false} = props;
  const route = useRoute();

  const match = exact
    ? route.pathname === path
      ? {params: {}, path}
      : null
    : matchPath(path, route.pathname);

  if (!match) return null;

  if (Component) {
    return <Component params={match.params}/>;
  }

  if (typeof children === 'function') {
    return children(match.params);
  }

  return <>{children}</>;
}