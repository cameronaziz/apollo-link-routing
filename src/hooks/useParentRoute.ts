import {useContext} from "react";
import {OutletContext} from "../components/Outlet";

export function useParentRoute() {
  const context = useContext(OutletContext);

  if (!context) {
    return null;
  }

  return {
    pathname: context.matches[context.matches.length - 2]?.pathname ?? '',
    params: context.matches[context.matches.length - 2]?.params ?? {},
  };
}