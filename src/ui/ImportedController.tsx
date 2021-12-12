import React, { createContext, useEffect, useState } from 'react';

interface ImportedState {
  usesHydration: boolean;
  pastHydration: boolean;
}

export const importedState = createContext<ImportedState | undefined>(undefined);

export const HydrationState: React.FC<{ state: ImportedState }> = ({ state, children }) => (
  <importedState.Provider value={state}>{children}</importedState.Provider>
);

/**
 * @see [LazyBoundary]{@link LazyBoundary} - HydrationController is required for LazyBoundary to properly work with React>16.10
 * Established a control over LazyBoundary suppressing fallback during the initial hydration
 * @param props
 * @param [props.usesHydration=true] determines of Application is rendered using hydrate
 */
export const ImportedController: React.FC<{
  /**
   * determines of Application is rendered using hydrate
   */
  usesHydration?: boolean;
}> = ({ children, usesHydration = true }) => {
  const [state, setState] = useState<ImportedState>({
    usesHydration,
    pastHydration: false,
  });

  useEffect(() => {
    setState((oldState) => ({ ...oldState, pastHydration: true }));
  }, []);

  return <HydrationState state={state}>{children}</HydrationState>;
};
