import { useEffect, useState } from 'react';

import {useRoute} from "../hooks/useRoute";

export function useRouteTransition(duration = 300) {
  const route = useRoute();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayRoute, setDisplayRoute] = useState(route);

  useEffect(() => {
    if (route.pathname !== displayRoute.pathname) {
      setIsTransitioning(true);

      setTimeout(() => {
        setDisplayRoute(route);
        setIsTransitioning(false);
      }, duration);
    }
  }, [route, displayRoute, duration]);

  return { displayRoute, isTransitioning };
}