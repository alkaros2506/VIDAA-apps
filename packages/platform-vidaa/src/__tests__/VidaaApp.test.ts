import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VidaaApp } from '../VidaaApp';

describe('VidaaApp', () => {
  beforeEach(() => {
    // Clean up any injected styles
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('injects global styles', () => {
    VidaaApp({ appName: 'Test' });
    const styles = document.querySelectorAll('style');
    expect(styles.length).toBeGreaterThan(0);
    expect(styles[0].textContent).toContain('cursor: none');
  });

  it('prevents context menu', () => {
    VidaaApp({ appName: 'Test' });
    const event = new Event('contextmenu', { cancelable: true });
    const prevented = !document.dispatchEvent(event);
    expect(prevented).toBe(true);
  });

  it('calls window.close on back key at root screen', () => {
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
    VidaaApp({ appName: 'Test', onRootBack: 'exit' });

    const event = new KeyboardEvent('keydown', { keyCode: 461 } as KeyboardEventInit);
    document.dispatchEvent(event);
    expect(closeSpy).toHaveBeenCalled();
    closeSpy.mockRestore();
  });
});
