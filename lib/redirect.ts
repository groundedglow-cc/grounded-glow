import { TRUSTED_REDIRECT_HOSTS } from './constants'

export function isTrustedRedirect(url: string): boolean {
  try {
    const parsed = new URL(url)
    return TRUSTED_REDIRECT_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    )
  } catch {
    return false
  }
}
