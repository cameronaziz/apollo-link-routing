import {FC, ReactNode, useMemo} from 'react';
import { RouteObject } from '../types';
import { matchRoutes } from '../lib/nested-matcher';
import { OutletProvider } from './Outlet';
import {useRoute} from "../hooks/useRoute";

interface RouterProps {
  children?: ReactNode;
  routes?: RouteObject[];
}

export const Router: FC<RouterProps> = (props) => {
  const { routes } = props
  const route = useRoute();

  const matches = useMemo(() => {
    if (!routes) {
      return null;
    }
    return matchRoutes(routes, route.pathname);
  }, [routes, route.pathname]);

  const renderedMatches = useMemo(() => matches?.reduceRight<ReactNode>((childElement, match, index) => {
    const element = match.route.element;

    return (
      <OutletProvider
        matches={matches.slice(0, index + 1)}
        element={childElement}
        contextData={match.route}
      >
        {element}
      </OutletProvider>
    );
  }, null), [matches]);

  if (!matches || matches.length === 0) {
    return null;
  }

  return <>{renderedMatches}</>;
}