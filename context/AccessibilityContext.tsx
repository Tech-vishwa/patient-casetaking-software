'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type TextScale = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  textScale: TextScale;
  cycleTextScale: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [textScale, setTextScale] = useState<TextScale>('normal');

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const cycleTextScale = () => {
    setTextScale((prev) => {
      if (prev === 'normal') return 'large';
      if (prev === 'large') return 'xlarge';
      return 'normal';
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    root.classList.remove('text-scale-large', 'text-scale-xlarge');
    if (textScale === 'large') {
      root.classList.add('text-scale-large');
    } else if (textScale === 'xlarge') {
      root.classList.add('text-scale-xlarge');
    }
  }, [highContrast, textScale]);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        textScale,
        cycleTextScale,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
