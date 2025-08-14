import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ForgeContextType {
  currentForgeTitle: string | null;
  setCurrentForgeTitle: (title: string | null) => void;
}

const ForgeContext = createContext<ForgeContextType | undefined>(undefined);

export const useForge = () => {
  const context = useContext(ForgeContext);
  if (context === undefined) {
    throw new Error('useForge must be used within a ForgeProvider');
  }
  return context;
};

interface ForgeProviderProps {
  children: ReactNode;
}

export const ForgeProvider: React.FC<ForgeProviderProps> = ({ children }) => {
  const [currentForgeTitle, setCurrentForgeTitle] = useState<string | null>(null);

  return (
    <ForgeContext.Provider value={{ currentForgeTitle, setCurrentForgeTitle }}>
      {children}
    </ForgeContext.Provider>
  );
};
