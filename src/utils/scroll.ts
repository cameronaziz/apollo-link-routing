import {scrollManager} from "../lib/ScrollManager";

export const clearScrollPosition = (pathname: string) => {
  scrollManager.clearPosition(pathname);
};
export const clearAllScrollPositions = () => {
  scrollManager.clearAll();
};