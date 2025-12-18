
import React, { createContext, useContext, useState } from 'react';
import { AppModule } from '../types';

interface ModuleContextType {
  currentModule: AppModule;
  setModule: (module: AppModule) => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to AI_VOICE as requested by user
  const [currentModule, setModule] = useState<AppModule>(AppModule.AI_VOICE);

  return (
    <ModuleContext.Provider value={{ currentModule, setModule }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModule = () => {
  const context = useContext(ModuleContext);
  if (!context) throw new Error("useModule must be used within ModuleProvider");
  return context;
};
