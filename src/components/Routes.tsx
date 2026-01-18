import {FC, ReactNode, useMemo} from 'react';
import { RouteObject } from '../types';
import { matchRoutes } from '../lib/nested-matcher';
import { OutletProvider } from './Outlet';
import {useRoute} from "../hooks/useRoute";

interface RoutesProps {
  children?: ReactNode;
  routes?: RouteObject[];
}

export const Routes: FC<RoutesProps> = (props) => {
  const { routes } = props
  const route = useRoute();

  const matches = useMemo(() => {
    if (!routes) return null;
    return matchRoutes(routes, route.pathname);
  }, [routes, route.pathname]);

  if (!matches || matches.length === 0) {
    return null;
  }

  const renderedMatches = matches.reduceRight<ReactNode>((outlet, match, index) => {
    const element = match.route.element;

    return (
      <OutletProvider
        matches={matches.slice(0, index + 1)}
        outlet={element || outlet}
        contextData={match.route}
      />
    );
  }, null);

  return <>{renderedMatches}</>;
}