/**
 * Prefixes a root-relative path with the site's base, so links keep working when the site is
 * served from a subdirectory, as pull request previews are.
 */
export function url(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path
}
