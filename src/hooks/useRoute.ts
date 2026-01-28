import {useReactiveVar} from "@apollo/client/react";
import {routeVar} from "../utils/cache";

export function useRoute() {
  return useReactiveVar(routeVar);
}