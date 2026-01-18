import {useEffect} from 'react';
import {useRoute} from "./useRoute";
import {scrollManager} from "../lib/ScrollManager";

export function useScrollRestoration() {
  const route = useRoute();

  useEffect(() => {
    const key = route.pathname;
    const savedPosition = scrollManager.getPosition(key);

    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    } else {
      window.scrollTo(0, 0);
    }

    const saveScrollPosition = () => {
      scrollManager.savePosition(key, window.scrollY);
    };

    window.addEventListener('beforeunload', saveScrollPosition);
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [route.pathname]);
}

