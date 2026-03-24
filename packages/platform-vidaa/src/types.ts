export interface VidaaConfig {
  /** App name shown on the VIDAA home screen */
  appName: string;
  /** App icon URL (recommended: 400x400 PNG) */
  iconUrl?: string;
  /** Handle the Back key on root screen — default exits the app */
  onRootBack?: 'exit' | 'confirm' | (() => void);
}

/**
 * VIDAA-specific global APIs injected by the Hisense browser environment.
 * These are only available when running on actual VIDAA hardware.
 */
declare global {
  interface Window {
    /** Hisense app installation API (available on some firmware versions) */
    Hisense_installApp?: (name: string, url: string, iconUrl: string) => void;
    /** Hisense app lifecycle callbacks */
    Hisense_onAppShow?: () => void;
    Hisense_onAppHide?: () => void;
  }
}
