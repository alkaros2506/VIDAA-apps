/**
 * Check if the Hisense install API is available.
 */
export function isInstallSupported(): boolean {
  return typeof window.Hisense_installApp === 'function';
}

/**
 * Install the web app to the VIDAA home screen.
 *
 * On older VIDAA firmware (2022 and earlier), use the hisense://debug method instead.
 *
 * @param name - App name for the home screen tile
 * @param url - URL of the web app
 * @param iconUrl - URL of the app icon (400x400 PNG recommended)
 */
export function installToHomeScreen(name: string, url: string, iconUrl: string): boolean {
  if (!isInstallSupported()) {
    console.warn(
      'Hisense_installApp is not available. ' +
      'On older firmware, navigate to hisense://debug in the TV browser to install apps.',
    );
    return false;
  }

  try {
    window.Hisense_installApp!(name, url, iconUrl);
    return true;
  } catch (error) {
    console.error('Failed to install app to home screen:', error);
    return false;
  }
}
