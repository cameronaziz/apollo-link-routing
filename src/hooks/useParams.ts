import {useRoute} from "./useRoute";

export function useParams() {
  const route = useRoute();
  return route.params;
}