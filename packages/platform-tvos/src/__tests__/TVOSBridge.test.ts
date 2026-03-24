import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TVOSBridge } from '../TVOSBridge';

describe('TVOSBridge', () => {
  beforeEach(() => {
    delete window.__TVOS_BRIDGE__;
    delete window.webkit;
  });

  describe('isAvailable', () => {
    it('returns false in browser', () => {
      expect(TVOSBridge.isAvailable()).toBe(false);
    });

    it('returns true when bridge flag is set', () => {
      window.__TVOS_BRIDGE__ = true;
      expect(TVOSBridge.isAvailable()).toBe(true);
    });
  });

  describe('send', () => {
    it('posts message to webkit handler when available', () => {
      const postMessage = vi.fn();
      window.webkit = { messageHandlers: { tvApp: { postMessage } } };
      const bridge = new TVOSBridge();
      bridge.send({ type: 'navigate', payload: { screen: 'home' } });
      expect(postMessage).toHaveBeenCalledWith({ type: 'navigate', payload: { screen: 'home' } });
    });

    it('warns when webkit not available', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const bridge = new TVOSBridge();
      bridge.send({ type: 'navigate', payload: {} });
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('on/handleMessage', () => {
    it('calls listeners for matching message type', () => {
      const bridge = new TVOSBridge();
      const callback = vi.fn();
      bridge.on('lifecycle', callback);
      const receive = (window as unknown as Record<string, unknown>).__tvos_receive as (msg: unknown) => void;
      receive({ type: 'lifecycle', payload: { state: 'active' } });
      expect(callback).toHaveBeenCalledWith({ state: 'active' });
    });

    it('returns unsubscribe function', () => {
      const bridge = new TVOSBridge();
      const callback = vi.fn();
      const unsub = bridge.on('lifecycle', callback);
      unsub();
      const receive = (window as unknown as Record<string, unknown>).__tvos_receive as (msg: unknown) => void;
      receive({ type: 'lifecycle', payload: {} });
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
