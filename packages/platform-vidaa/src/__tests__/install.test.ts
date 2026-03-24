import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isInstallSupported, installToHomeScreen } from '../install';

describe('VIDAA install', () => {
  beforeEach(() => {
    delete window.Hisense_installApp;
  });

  describe('isInstallSupported', () => {
    it('returns false when API not available', () => {
      expect(isInstallSupported()).toBe(false);
    });

    it('returns true when API is available', () => {
      window.Hisense_installApp = vi.fn();
      expect(isInstallSupported()).toBe(true);
    });
  });

  describe('installToHomeScreen', () => {
    it('returns false when API not available', () => {
      expect(installToHomeScreen('Test', 'http://test.com', 'http://test.com/icon.png')).toBe(false);
    });

    it('calls Hisense_installApp with correct args', () => {
      window.Hisense_installApp = vi.fn();
      const result = installToHomeScreen('MyApp', 'http://app.com', 'http://app.com/icon.png');
      expect(result).toBe(true);
      expect(window.Hisense_installApp).toHaveBeenCalledWith('MyApp', 'http://app.com', 'http://app.com/icon.png');
    });

    it('returns false when API throws', () => {
      window.Hisense_installApp = vi.fn().mockImplementation(() => {
        throw new Error('install failed');
      });
      expect(installToHomeScreen('Test', 'http://test.com', 'http://test.com/icon.png')).toBe(false);
    });
  });
});
