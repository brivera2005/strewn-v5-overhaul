/** Resolve public/ asset paths for Vite dev server and Electron file:// */
export function assetUrl(path: string): string {
  const normalized = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${normalized}`;
}
