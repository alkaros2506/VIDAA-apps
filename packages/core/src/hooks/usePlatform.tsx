import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

export type Platform = 'vidaa' | 'tizen' | 'webos' | 'tvos' | 'android-tv' | 'browser';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'browser';

  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('hisense') || ua.includes('vidaa')) return 'vidaa';
  if (ua.includes('tizen')) return 'tizen';
  if (ua.includes('webos') || ua.includes('web0s')) return 'webos';
  // tvOS detection via JS bridge flag set by native wrapper
  if (typeof (window as unknown as Record<string, unknown>).__TVOS_BRIDGE__ !== 'undefined') return 'tvos';
  if (ua.includes('android') && (ua.includes('tv') || ua.includes('aftt'))) return 'android-tv';

  return 'browser';
}

const PlatformContext = createContext<Platform>('browser');

export function PlatformProvider({ children }: { children: ReactNode }) {
  const platform = useMemo(() => detectPlatform(), []);

  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): Platform {
  return useContext(PlatformContext);
}
