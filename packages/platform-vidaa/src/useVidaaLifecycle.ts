import { useEffect, useCallback } from 'react';

interface VidaaLifecycleCallbacks {
  onShow?: () => void;
  onHide?: () => void;
}

/**
 * Hook for VIDAA app lifecycle events.
 * VIDAA calls these when the app is suspended/resumed (e.g., user presses Home).
 */
export function useVidaaLifecycle(callbacks: VidaaLifecycleCallbacks): void {
  const { onShow, onHide } = callbacks;

  const handleShow = useCallback(() => {
    onShow?.();
  }, [onShow]);

  const handleHide = useCallback(() => {
    onHide?.();
  }, [onHide]);

  useEffect(() => {
    window.Hisense_onAppShow = handleShow;
    window.Hisense_onAppHide = handleHide;

    // Also listen for standard visibility change as fallback
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleShow();
      } else {
        handleHide();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      delete window.Hisense_onAppShow;
      delete window.Hisense_onAppHide;
    };
  }, [handleShow, handleHide]);
}
