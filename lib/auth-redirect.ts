import { getPortalRouteByPermissions } from '@/lib/rbac/permissions'

const LOGIN_PATH = '/login'
const APP_ORIGIN = 'https://app.local'
type PermissionSource = Iterable<string> | Set<string>

function isWithinPath(pathname: string, root: string) {
  return pathname === root || pathname.startsWith(`${root}/`)
}

export function getCurrentAppDestination() {
  if (typeof window === 'undefined') {
    return null
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export function getLoginUrl(destination = getCurrentAppDestination()) {
  const validatedDestination = validateInternalDestination(destination)

  return validatedDestination
    ? `${LOGIN_PATH}?next=${encodeURIComponent(validatedDestination)}`
    : LOGIN_PATH
}

export function validateInternalDestination(destination: string | null | undefined) {
  if (!destination || !destination.startsWith('/') || destination.startsWith('//')) {
    return null
  }

  try {
    const url = new URL(destination, APP_ORIGIN)
    const decodedPathname = decodeURIComponent(url.pathname)

    if (
      url.origin !== APP_ORIGIN ||
      decodedPathname.startsWith('//') ||
      isWithinPath(decodedPathname, LOGIN_PATH)
    ) {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export function getPostLoginDestination(
  destination: string | null | undefined,
  role: string | null | undefined,
  permissions: PermissionSource,
) {
  const fallback = getPortalRouteByPermissions(role, permissions)
  const validatedDestination = validateInternalDestination(destination)

  if (!validatedDestination) {
    return fallback
  }

  const destinationPathname = new URL(validatedDestination, APP_ORIGIN).pathname
  const portalRoot = fallback === '/admin' ? '/admin' : '/dashboard'

  return isWithinPath(destinationPathname, portalRoot) ? validatedDestination : fallback
}
