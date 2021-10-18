import { useContext } from 'react';

import { importedState } from '../ui/ImportedController';

/**
 * returns "true" if currently is a "client" phase and all features should be active
 * @see {@link HydrationController}
 */
export const useIsClientPhase = (): boolean => {
  const value = useContext(importedState);

  if (!value) {
    if (process.env.NODE_ENV !== 'production') {
      // tslint:disable-next-line:no-console
      console.warn('react-imported-component: please wrap your entire application with ImportedController');
    }

    return true;
  }

  return value.pastHydration;
};
