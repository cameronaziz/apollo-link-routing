import {useReactiveVar} from "@apollo/client";
import {routeVar} from "../utils/cache";

export function useRoute() {
  return useReactiveVar(routeVar);
}