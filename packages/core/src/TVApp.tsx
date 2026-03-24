import React, { type ReactNode } from 'react';
import { NavigationProvider } from './navigation';
import { PlatformProvider } from './hooks/usePlatform';

interface TVAppProps {
  children: ReactNode;
  /** Enable spatial navigation visual debug overlay */
  debug?: boolean;
}

/**
 * Root wrapper for TV apps. Sets up spatial navigation and platform detection.
 */
export function TVApp({ children, debug = false }: TVAppProps) {
  return (
    <PlatformProvider>
      <NavigationProvider debug={debug}>
        <div className="tv-app" style={{ cursor: 'none', overflow: 'hidden', width: '100vw', height: '100vh' }}>
          {children}
        </div>
      </NavigationProvider>
    </PlatformProvider>
  );
}
