import * as React from 'react';
import { defaultStream } from '../loadable/stream';
import { Stream } from '../types';

export const streamContext = React.createContext(defaultStream);

/**
 * SSR. Tracker for used marks
 */
export const ImportedStream: React.FC<{
  stream: Stream;
}> = ({ stream, children, ...props }) => {
  if (process.env.NODE_ENV !== 'development') {
    if ('takeUID' in props) {
      throw new Error('react-imported-component: `takeUID` was replaced by `stream`.');
    }
  }

  return <streamContext.Provider value={stream}>{children}</streamContext.Provider>;
};

export const UIDConsumer = streamContext.Consumer;
