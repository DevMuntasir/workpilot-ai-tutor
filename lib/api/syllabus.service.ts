import { ApiClientError, apiClient } from '@/lib/api/client'

export type SyllabusUploadWebsocket = {
  url: string
  token: string
  expires_in: number
}

export type SyllabusUploadResponse = {
  syllabus_id: string
  job_id: string
  websocket: SyllabusUploadWebsocket
  stream_url: string
}

type UploadSyllabusTextPayload = {
  title: string
  text: string
  semesterStartDate: string
  semesterEndDate: string
}

type UploadSyllabusPdfPayload = {
  title: string
  file: File
  semesterStartDate: string
  semesterEndDate: string
}

function normalizeUploadResponse(payload: unknown): SyllabusUploadResponse {
  if (!payload || typeof payload !== 'object') {
    throw new ApiClientError('Syllabus upload failed: invalid response payload.')
  }

  const response = payload as Partial<SyllabusUploadResponse>

  if (typeof response.syllabus_id !== 'string' || !response.syllabus_id.trim()) {
    throw new ApiClientError('Syllabus upload failed: missing syllabus id in response payload.')
  }

  if (typeof response.job_id !== 'string' || !response.job_id.trim()) {
    throw new ApiClientError('Syllabus upload failed: missing job id in response payload.')
  }

  if (!response.websocket || typeof response.websocket !== 'object') {
    throw new ApiClientError('Syllabus upload failed: missing websocket metadata.')
  }

  if (typeof response.websocket.url !== 'string' || !response.websocket.url.trim()) {
    throw new ApiClientError('Syllabus upload failed: missing websocket URL.')
  }

  if (typeof response.websocket.token !== 'string' || !response.websocket.token.trim()) {
    throw new ApiClientError('Syllabus upload failed: missing websocket token.')
  }

  return {
    syllabus_id: response.syllabus_id,
    job_id: response.job_id,
    websocket: {
      url: response.websocket.url,
      token: response.websocket.token,
      expires_in:
        typeof response.websocket.expires_in === 'number' ? response.websocket.expires_in : 0,
    },
    stream_url: typeof response.stream_url === 'string' ? response.stream_url : '',
  }
}

export async function uploadSyllabusText(payload: UploadSyllabusTextPayload) {
  const formData = new FormData()
  formData.set('title', payload.title)
  formData.set('text', payload.text)
  formData.set('semester_start_date', payload.semesterStartDate)
  formData.set('semester_end_date', payload.semesterEndDate)

  const response = await apiClient.request<SyllabusUploadResponse>('/api/v1/syllabus/upload/text', {
    method: 'POST',
    body: formData,
  })

  return normalizeUploadResponse(response)
}

export async function uploadSyllabusPdf(payload: UploadSyllabusPdfPayload) {
  const formData = new FormData()
  formData.set('title', payload.title)
  formData.set('file', payload.file)
  formData.set('semester_start_date', payload.semesterStartDate)
  formData.set('semester_end_date', payload.semesterEndDate)

  const response = await apiClient.request<SyllabusUploadResponse>('/api/v1/syllabus/upload/pdf', {
    method: 'POST',
    body: formData,
  })

  return normalizeUploadResponse(response)
}
