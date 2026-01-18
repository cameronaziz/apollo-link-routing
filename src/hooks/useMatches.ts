import {useContext} from "react";
import {OutletContext} from "../components/Outlet";

export function useMatches() {
  const context = useContext(OutletContext);
  return context?.matches || [];
}