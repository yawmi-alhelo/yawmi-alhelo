export const APP_VERSION = '1.0.0';
export async function checkUpdates() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/yawmi-alhelo/yawmi-alhelo/master/package.json');
    const data = await res.json();
    if (data.version && data.version !== APP_VERSION) {
      return { hasUpdate: true, latestVersion: data.version, url: 'https://github.com/yawmi-alhelo/yawmi-alhelo/actions' };
    }
    return { hasUpdate: false };
  } catch { return { hasUpdate: false, error: true }; }
}
