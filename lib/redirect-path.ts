const FALLBACK_REDIRECT_PATH = '/dashboard'

export function sanitizeRedirectPath(
  value: string | null | undefined,
  fallback = FALLBACK_REDIRECT_PATH,
) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  try {
    const url = new URL(value, 'https://peridot.local')
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
