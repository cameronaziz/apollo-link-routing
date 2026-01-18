import {useRoute} from "./useRoute";

export function useSearchParams() {
  const route = useRoute();
  return route.query;
}