/**
 * Convert a GitHub repository URL to its ZIP archive download URL.
 * Supports: https://github.com/owner/repo, with or without trailing slash or .git
 * Returns null for non-GitHub URLs or invalid formats.
 */
export function repoZipUrl(repoUrl: string | null): string | null {
  if (!repoUrl) return null
  try {
    const url = new URL(repoUrl)
    if (url.hostname !== 'github.com') return null
    const parts = url.pathname.replace(/\.git$/, '').replace(/\/$/, '').split('/').filter(Boolean)
    if (parts.length < 2) return null
    return `https://github.com/${parts[0]}/${parts[1]}/archive/refs/heads/main.zip`
  } catch {
    return null
  }
}
