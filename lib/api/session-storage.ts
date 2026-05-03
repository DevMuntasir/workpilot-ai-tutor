const AUTH_SESSION_STORAGE_KEY = 'ai_tutora_auth_session'
const FIREBASE_STORAGE_KEY_PREFIX = 'firebase:'
const ACCESS_TOKEN_EXPIRY_LEEWAY_MS = 30_000

export type StoredAuthObject = {
  token_type: string
  access_token: string
  expires_at: string
  refresh_token: string
  refresh_expires_at: string
  user_role?: string
  user_display_name?: string
}

const isBrowser = () => typeof window !== 'undefined'

export function saveAuthObject(auth: StoredAuthObject) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(auth))
}

export function getStoredAuthObject(): StoredAuthObject | null {
  if (!isBrowser()) {
    return null
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredAuthObject>

    if (
      typeof parsedValue?.access_token !== 'string' ||
      typeof parsedValue?.token_type !== 'string' ||
      typeof parsedValue?.expires_at !== 'string' ||
      typeof parsedValue?.refresh_token !== 'string' ||
      typeof parsedValue?.refresh_expires_at !== 'string'
    ) {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
      return null
    }

    return parsedValue as StoredAuthObject
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
    return null
  }
}

export function getStoredAccessToken() {
  return getStoredAuthObject()?.access_token ?? null
}

function parseAuthTimestamp(value: string) {
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp) ? null : timestamp
}

export function isAuthTokenExpired(expiresAt: string, leewayMs = ACCESS_TOKEN_EXPIRY_LEEWAY_MS) {
  const expiresAtTimestamp = parseAuthTimestamp(expiresAt)

  if (expiresAtTimestamp === null) {
    return true
  }

  return expiresAtTimestamp - leewayMs <= Date.now()
}

export function isStoredAccessTokenExpired() {
  const storedAuth = getStoredAuthObject()

  if (!storedAuth?.access_token) {
    return true
  }

  return isAuthTokenExpired(storedAuth.expires_at)
}

export function isStoredRefreshTokenUsable() {
  const storedAuth = getStoredAuthObject()

  if (!storedAuth?.refresh_token) {
    return false
  }

  return !isAuthTokenExpired(storedAuth.refresh_expires_at, 0)
}

export function replaceStoredAuthObject(auth: StoredAuthObject) {
  const currentAuth = getStoredAuthObject()
  saveAuthObject({
    ...auth,
    user_role: auth.user_role ?? currentAuth?.user_role,
    user_display_name: auth.user_display_name ?? currentAuth?.user_display_name,
  })
}

export function clearStoredAuthObject() {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}

function clearFirebaseEntries(storage: Storage) {
  const keysToDelete: string[] = []

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)

    if (key?.startsWith(FIREBASE_STORAGE_KEY_PREFIX)) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach((key) => {
    storage.removeItem(key)
  })
}

export function clearAuthBrowserState() {
  if (!isBrowser()) {
    return
  }

  clearStoredAuthObject()
  window.sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
  clearFirebaseEntries(window.localStorage)
  clearFirebaseEntries(window.sessionStorage)
}
