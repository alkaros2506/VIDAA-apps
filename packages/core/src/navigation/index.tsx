import React, { type ReactNode, useEffect } from 'react';
import {
  init,
  useFocusable as useNoriginFocusable,
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation';

let initialized = false;

interface NavigationProviderProps {
  children: ReactNode;
  debug?: boolean;
}

export function NavigationProvider({ children, debug = false }: NavigationProviderProps) {
  useEffect(() => {
    if (!initialized) {
      init({
        debug,
        visualDebug: debug,
      });
      initialized = true;
    }
  }, [debug]);

  const { ref, focusKey } = useNoriginFocusable();

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </FocusContext.Provider>
  );
}

export { useNoriginFocusable as useFocusable };

interface FocusableItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: (props: { ref: React.RefObject<any>; focused: boolean }) => ReactNode;
  onEnterPress?: () => void;
  focusKey?: string;
}

export function FocusableItem({ children, onEnterPress, focusKey }: FocusableItemProps) {
  const { ref, focused } = useNoriginFocusable({
    onEnterPress,
    focusKey,
  });

  return <>{children({ ref, focused })}</>;
}
