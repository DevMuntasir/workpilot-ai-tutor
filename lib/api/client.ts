import { getStoredAccessToken } from '@/lib/api/session-storage'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type ApiRequestOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
  omitDefaultHeaders?: boolean
  omitAuthHeader?: boolean
}

type ApiClientConfig = {
  baseUrl?: string
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 15_000

export class ApiClientError extends Error {
  status: number
  data: unknown

  constructor(message: string, status = 0, data: unknown = null) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  )
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return null
  }

  if ('message' in payload && typeof payload.message === 'string') {
    return payload.message
  }

  if ('error' in payload && typeof payload.error === 'string') {
    return payload.error
  }

  if ('detail' in payload) {
    const detail = payload.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail) && detail.length > 0) {
      const firstDetail = detail[0]

      if (firstDetail && typeof firstDetail === 'object' && 'msg' in firstDetail && typeof firstDetail.msg === 'string') {
        return firstDetail.msg
      }
    }
  }

  return null
}

function parseResponsePayload(responseText: string): unknown {
  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '')
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  async request<TResponse>(path: string, options: ApiRequestOptions = {}) {
    const {
      method = 'GET',
      body,
      headers,
      signal,
      omitDefaultHeaders = false,
      omitAuthHeader = false,
    } = options

    const requestHeaders = new Headers()

    if (!omitDefaultHeaders) {
      requestHeaders.set('accept', 'application/json')
    }

    if (!omitAuthHeader) {
      const accessToken = getStoredAccessToken()

      if (accessToken) {
        requestHeaders.set('authorization', `Bearer ${accessToken}`)
      }
    }

    if (headers) {
      const customHeaders = new Headers(headers)
      customHeaders.forEach((value, key) => {
        requestHeaders.set(key, value)
      })
    }

    let requestBody: BodyInit | undefined

    if (typeof body !== 'undefined') {
      if (isBodyInit(body)) {
        requestBody = body
      } else {
        requestBody = JSON.stringify(body)

        if (!omitDefaultHeaders && !requestHeaders.has('content-type')) {
          requestHeaders.set('content-type', 'application/json')
        }
      }
    }

    const abortController = new AbortController()
    const timeoutHandle = setTimeout(() => abortController.abort(), this.timeoutMs)

    if (signal) {
      signal.addEventListener('abort', () => abortController.abort(), { once: true })
    }

    const requestUrl = `${this.baseUrl}${path}`

    try {
      const response = await fetch(requestUrl, {
        method,
        body: requestBody,
        headers: requestHeaders,
        signal: abortController.signal,
      })

      const responseText = await response.text()
      const responseData = parseResponsePayload(responseText)

      if (!response.ok) {
        const message = extractErrorMessage(responseData) ?? `Request failed with status ${response.status}`
        throw new ApiClientError(message, response.status, responseData)
      }

      return responseData as TResponse
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError('Request timed out. Please try again.')
      }

      throw new ApiClientError('Network error. Please check your connection and try again.')
    } finally {
      clearTimeout(timeoutHandle)
    }
  }
}

export const apiClient = new ApiClient()

export function getApiClientErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiClientError) {
    return error.message
  }

  return fallbackMessage
}
