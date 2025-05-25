import React, { createContext, useContext } from 'react';

// Create context for tabs state
type TabsContextType = {
  value: string;
  onChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

// Custom hook to use tabs context
const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// Tabs container component
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className = '',
}) => {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

// TabsList component
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex space-x-1 p-1 bg-gray-800 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

// TabsTrigger component
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
  disabled = false,
}) => {
  const { value: selectedValue, onChange } = useTabsContext();
  
  const isSelected = selectedValue === value;
  
  return (
    <button
      className={`
        px-4 py-2 font-medium rounded-lg transition-colors
        ${isSelected 
          ? 'bg-[#9b9b6f] text-black' 
          : 'text-white hover:bg-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
    >
      {children}
    </button>
  );
};

// TabsContent component
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
}) => {
  const { value: selectedValue } = useTabsContext();
  
  if (selectedValue !== value) {
    return null;
  }
  
  return (
    <div className={`mt-2 ${className}`} role="tabpanel">
      {children}
    </div>
  );
};