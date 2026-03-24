import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { PlatformProvider, usePlatform } from '../hooks/usePlatform';

function wrapper({ children }: { children: React.ReactNode }) {
  return <PlatformProvider>{children}</PlatformProvider>;
}

describe('usePlatform', () => {
  it('returns browser as default platform in test env', () => {
    const { result } = renderHook(() => usePlatform(), { wrapper });
    expect(result.current).toBe('browser');
  });

  it('returns browser without provider', () => {
    const { result } = renderHook(() => usePlatform());
    expect(result.current).toBe('browser');
  });
});
