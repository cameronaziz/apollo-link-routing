import {createContext, useContext, ReactNode, FC} from 'react';
import {RouteMatch} from '../types';

interface OutletContextValue {
  matches: RouteMatch[];
  element: ReactNode;
  contextData?: any;
}

export const OutletContext = createContext<OutletContextValue | null>(null);

interface OutletProviderProps {
  matches: RouteMatch[];
  element: ReactNode;
  contextData?: any;
  children?: ReactNode;
}

export const OutletProvider: FC<OutletProviderProps> = (props) => {
  const {
    matches,
    element,
    contextData,
    children
  } = props

  return (
    <OutletContext.Provider value={{matches, element, contextData}}>
      {children}
    </OutletContext.Provider>
  );
}

interface OutletProps {
  context?: any;
}

export const Outlet: FC<OutletProps> = (props) => {
  const { context } = props;
  const parentContext = useContext(OutletContext);

  if (!parentContext) {
    throw new Error('Outlet must be used within a Router component');
  }

  // Merge the passed context with parent context
  const mergedContext = {
    ...parentContext,
    contextData: context ?? parentContext.contextData
  };

  return (
    <OutletContext.Provider value={mergedContext}>
      {parentContext.element}
    </OutletContext.Provider>
  );
}