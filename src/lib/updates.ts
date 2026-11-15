export const APP_VERSION = '1.2.0';

const RELEASE_API =
  'https://api.github.com/repos/yawmi-alhelo/yawmi-alhelo/releases/latest';

export type UpdateResult =
  | { hasUpdate: true; latestVersion: string; url: string }
  | { hasUpdate: false; error?: boolean };

function compareVersions(a: string, b: string): number {
  const left = a.replace(/^v/, '').split('.').map(Number);
  const right = b.replace(/^v/, '').split('.').map(Number);

  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const x = left[i] || 0;
    const y = right[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export async function checkUpdates(): Promise<UpdateResult> {
  try {
    const response = await fetch(RELEASE_API, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store',
    });

    if (!response.ok) return { hasUpdate: false, error: true };

    const release = await response.json();
    const latestVersion = String(release.tag_name || '').replace(/^v/, '');
    const apk = release.assets?.find(
      (asset: { name?: string; browser_download_url?: string }) =>
        asset.name === 'app-debug.apk' && asset.browser_download_url
    );

    if (!latestVersion || !apk) return { hasUpdate: false, error: true };

    if (compareVersions(latestVersion, APP_VERSION) > 0) {
      return {
        hasUpdate: true,
        latestVersion,
        url: apk.browser_download_url,
      };
    }

    return { hasUpdate: false };
  } catch {
    return { hasUpdate: false, error: true };
  }
}
