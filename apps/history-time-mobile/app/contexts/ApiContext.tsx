/**
 * API Context for providing the shared adapter throughout the app
 */
import React, { createContext, useContext, ReactNode } from 'react';

import { SharedAdapter, createSharedAdapter } from '../services/sharedAdapter';

// Create context with default value
const ApiContext = createContext<SharedAdapter | null>(null);

// Create provider component
interface ApiProviderProps {
  children: ReactNode;
  adapter?: SharedAdapter;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({
  children,
  adapter = createSharedAdapter(),
}) => {
  return <ApiContext.Provider value={adapter}>{children}</ApiContext.Provider>;
};

// Custom hook for using the API context
export const useApi = (): SharedAdapter => {
  const context = useContext(ApiContext);

  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }

  return context;
};

export default ApiContext;
