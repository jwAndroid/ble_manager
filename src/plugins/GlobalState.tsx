import React, { createContext, useContext, useState, ReactNode } from 'react';

type Property = {
   characteristic: string;
   service: string;
};

type Device = {
   peripheralId: string;
   name: string;
   isConnected: boolean;
   properties: {
      write: Property;
      notify: Property;
   };
};

interface State {
   device: Device | null;
   setDevice: (device: Device | null) => void;
   reset: () => void;
}

const GlobalStateContext = createContext<State | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const [device, setDevice] = useState<Device | null>(null);

   return (
      <GlobalStateContext.Provider value={{ device, setDevice, reset: () => setDevice(null) }}>
         {children}
      </GlobalStateContext.Provider>
   );
};

export const useGlobalState = (): State => {
   const context = useContext(GlobalStateContext);

   if (context === undefined) {
      throw new Error('Error: useGlobalState must be used within a GlobalStateProvider');
   }

   return context;
};
