/**
 * Configuration for the tvOS native wrapper integration.
 * The React app runs inside a WKWebView hosted by a Swift app.
 */
export interface TVOSConfig {
  /** App bundle identifier */
  bundleId: string;
  /** Enable native top shelf integration */
  topShelf?: boolean;
}

/**
 * Messages exchanged between the WKWebView (JS) and the native Swift shell.
 * Communication happens via webkit.messageHandlers (JS → Swift)
 * and evaluateJavaScript (Swift → JS).
 */
export interface TVOSMessage {
  type: 'navigate' | 'playMedia' | 'focusEngine' | 'lifecycle' | 'topShelf';
  payload: Record<string, unknown>;
}

/**
 * The webkit.messageHandlers bridge injected by WKWebView.
 */
declare global {
  interface Window {
    __TVOS_BRIDGE__?: boolean;
    webkit?: {
      messageHandlers: {
        tvApp: {
          postMessage: (message: TVOSMessage) => void;
        };
      };
    };
  }
}
