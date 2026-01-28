import {createContext, useContext, ReactNode, FC} from 'react';
import {RouteMatch} from '../types';

interface OutletContextValue {
  matches: RouteMatch[];
  outlet: ReactNode;
  contextData?: any;
}

export const OutletContext = createContext<OutletContextValue | null>(null);


interface OutletProviderWithChildrenProps extends OutletContextValue {
  children?: ReactNode;
}

export const OutletProvider: FC<OutletProviderWithChildrenProps> = (props) => {
  const {
    matches,
    outlet,
    contextData,
    children
  } = props

  return (
    <OutletContext.Provider value={{matches, outlet, contextData}}>
      {children !== undefined ? children : outlet}
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
      {parentContext.outlet}
    </OutletContext.Provider>
  );
}