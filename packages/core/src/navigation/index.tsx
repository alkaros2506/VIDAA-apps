import React, { type ReactNode, useEffect } from 'react';
import {
  init,
  useFocusable as useNoriginFocusable,
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation';

let initialized = false;

function ensureInit(debug: boolean) {
  if (!initialized) {
    init({
      debug,
      visualDebug: debug,
    });
    initialized = true;
  }
}

interface NavigationProviderProps {
  children: ReactNode;
  debug?: boolean;
}

export function NavigationProvider({ children, debug = false }: NavigationProviderProps) {
  // init() MUST run synchronously before any useFocusable() hooks
  ensureInit(debug);

  const { ref, focusKey, focusSelf } = useNoriginFocusable({
    isFocusBoundary: false,
  });

  // Set focus on the root after mount so the first focusable child receives focus
  useEffect(() => {
    focusSelf();
  }, [focusSelf]);

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
  const { ref, focused, focusSelf } = useNoriginFocusable({
    onEnterPress,
    focusKey,
  });

  const handleClick = () => {
    focusSelf();
    onEnterPress?.();
  };

  return <div onClick={handleClick} style={{ display: 'contents' }}>{children({ ref, focused })}</div>;
}
