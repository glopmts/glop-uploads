import React, { createContext, ReactNode, useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Create a context to track if we're already inside a DndProvider
const DndContext = createContext<boolean>(false);

// eslint-disable-next-line react-refresh/only-export-components
export const useDndContext = () => useContext(DndContext);

interface DndProviderWrapperProps {
  children: ReactNode;
}

export const DndProviderWrapper: React.FC<DndProviderWrapperProps> = ({ children }) => {
  const isInsideDndProvider = useDndContext();

  // If we're already inside a DndProvider, just render children
  if (isInsideDndProvider) {
    return <>{children}</>;
  }

  // Otherwise, create a new DndProvider and set context to true
  return (
    <DndContext.Provider value={true}>
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    </DndContext.Provider>
  );
};
