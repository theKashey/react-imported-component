import * as React from 'react';

export const streamContext = React.createContext(0);

let UID = 1;

interface TakeProps {
  takeUID(stream: number): void;
}

export const ImportedStream: React.FC<TakeProps> = ({takeUID, children}) => {
  const [uid] = React.useState(() => {
    const id = UID++;
    if (!takeUID) {
      throw new Error('You have to provide takeUID prop to ImportedStream');
    }
    takeUID(id);
    return id;
  });

  return (
    <streamContext.Provider value={uid}>
      {children}
    </streamContext.Provider>
  )
};

export const UIDConsumer = streamContext.Consumer;
