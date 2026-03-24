import type { TVOSMessage } from './types';

/**
 * Bridge between the web app and the native tvOS Swift wrapper.
 *
 * Architecture:
 * - The Swift app hosts a WKWebView that loads the React app
 * - JS → Swift: via webkit.messageHandlers.tvApp.postMessage()
 * - Swift → JS: via WKWebView.evaluateJavaScript()
 * - The Swift side handles: Siri Remote gestures, focus engine, Top Shelf, media playback
 */
export class TVOSBridge {
  private listeners = new Map<string, Set<(payload: Record<string, unknown>) => void>>();

  constructor() {
    (window as unknown as Record<string, unknown>).__tvos_receive = (message: TVOSMessage) => {
      this.handleMessage(message);
    };
  }

  static isAvailable(): boolean {
    return typeof window.__TVOS_BRIDGE__ !== 'undefined';
  }

  send(message: TVOSMessage): void {
    if (window.webkit?.messageHandlers?.tvApp) {
      window.webkit.messageHandlers.tvApp.postMessage(message);
    } else {
      console.warn('tvOS bridge not available — running in browser mode');
    }
  }

  playMedia(url: string, title?: string): void {
    this.send({ type: 'playMedia', payload: { url, title } });
  }

  updateTopShelf(items: Array<{ title: string; imageUrl: string; id: string }>): void {
    this.send({ type: 'topShelf', payload: { items } });
  }

  on(type: TVOSMessage['type'], callback: (payload: Record<string, unknown>) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
    return () => { this.listeners.get(type)?.delete(callback); };
  }

  private handleMessage(message: TVOSMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      for (const cb of listeners) {
        cb(message.payload);
      }
    }
  }
}
