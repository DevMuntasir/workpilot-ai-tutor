'use client'

import { ApiClientError } from '@/lib/api/client'
import type { SyllabusUploadWebsocket } from '@/lib/api/syllabus.service'
import {
  normalizeSyllabusBackendResultPayload,
  type SyllabusIntelligenceResult,
} from './utils'

type WaitForSyllabusSummaryOptions = {
  syllabusId: string
  websocket: SyllabusUploadWebsocket
  titleFallback?: string
}

const SYLLABUS_SOCKET_TIMEOUT_MS = 5 * 60_000

function appendTokenToWebSocketUrl(url: string, token: string) {
  try {
    const nextUrl = new URL(url)

    if (!nextUrl.searchParams.has('token')) {
      nextUrl.searchParams.set('token', token)
    }

    return nextUrl.toString()
  } catch {
    const separator = url.includes('?') ? '&' : '?'
    return url.includes('token=') ? url : `${url}${separator}token=${encodeURIComponent(token)}`
  }
}

function extractMessageData(message: unknown): unknown[] {
  if (!message || typeof message !== 'object') {
    return []
  }

  const source = message as Record<string, unknown>

  return [
    source.result,
    source.summary,
    source.data,
    source.payload,
    source.final_result,
    source.finalResult,
    source.summary_result,
    source.summaryResult,
    source.syllabus,
    source,
  ]
}

function resolveResultFromSocketMessage(
  message: unknown,
  titleFallback: string,
  syllabusId: string,
): SyllabusIntelligenceResult | null {
  for (const candidate of extractMessageData(message)) {
    const normalized = normalizeSyllabusBackendResultPayload(candidate, {
      titleFallback,
      syllabusId,
    })

    if (normalized) {
      return normalized
    }
  }

  return null
}

export function waitForSyllabusSummary({
  syllabusId,
  websocket,
  titleFallback = 'Untitled Syllabus',
}: WaitForSyllabusSummaryOptions) {
  return new Promise<SyllabusIntelligenceResult>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new ApiClientError('Syllabus tracking is only available in the browser.'))
      return
    }

    if (!websocket.url || !websocket.token) {
      reject(new ApiClientError('Syllabus tracking metadata is missing.'))
      return
    }

    const socketUrl = appendTokenToWebSocketUrl(websocket.url, websocket.token)
    let socket: WebSocket | null = null
    let settled = false

    const cleanup = () => {
      window.clearTimeout(timeoutId)

      if (socket) {
        socket.onopen = null
        socket.onmessage = null
        socket.onerror = null
        socket.onclose = null
        socket.close()
      }
    }

    const settleError = (message: string) => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      reject(new ApiClientError(message))
    }

    const settleSuccess = (result: SyllabusIntelligenceResult) => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      resolve(result)
    }

    const timeoutId = window.setTimeout(() => {
      settleError('Syllabus analysis timed out before a final result was received.')
    }, SYLLABUS_SOCKET_TIMEOUT_MS)

    try {
      socket = new window.WebSocket(socketUrl)
    } catch {
      settleError('Unable to start syllabus tracking.')
      return
    }

    socket.onmessage = (event) => {
      let parsedMessage: unknown = null

      try {
        parsedMessage = JSON.parse(String(event.data))
      } catch {
        return
      }

      const normalized = resolveResultFromSocketMessage(parsedMessage, titleFallback, syllabusId)

      if (normalized) {
        settleSuccess(normalized)
      }
    }

    socket.onerror = () => {
      settleError('Live syllabus analysis connection failed.')
    }

    socket.onclose = () => {
      if (!settled) {
        settleError('Syllabus analysis connection closed before a final result was received.')
      }
    }
  })
}
