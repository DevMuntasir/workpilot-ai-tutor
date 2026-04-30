import { apiClient } from '@/lib/api/client'

type ApiRecord = Record<string, unknown>

type AdminModelConfigsResponse = {
  configs?: unknown
  data?: unknown
}

export type ModelProvider = 'anthropic' | 'cloudflare' | 'elevenlabs'

export type AdminModelConfig = {
  id: string
  task_type: string
  provider: ModelProvider
  model_name: string
  model_version: string | null
  fallback_model_name: string | null
  fallback_provider: ModelProvider | null
  token_multiplier: number
  rollout_percentage: number
  is_active: boolean
  rolled_out_at: string | null
}

export type CreateAdminModelConfigPayload = {
  model_name: string
  provider: ModelProvider
  task_type: string
  token_multiplier: number
  fallback_model_name?: string | null
  fallback_provider?: ModelProvider | null
  is_active?: boolean | null
  model_version?: string | null
  rollout_percentage: number
}

export type UpdateAdminModelConfigPayload = Partial<CreateAdminModelConfigPayload>

function asRecord(value: unknown): ApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readOptionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readProvider(value: unknown): ModelProvider | null {
  return value === 'anthropic' || value === 'cloudflare' || value === 'elevenlabs' ? value : null
}

function normalizeAdminModelConfig(value: unknown): AdminModelConfig | null {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  const id = readString(record.id)
  const taskType = readString(record.task_type)
  const provider = readProvider(record.provider)
  const modelName = readString(record.model_name)
  const tokenMultiplier = readNumber(record.token_multiplier)
  const rolloutPercentage = readNumber(record.rollout_percentage)

  if (!id || !taskType || !provider || !modelName || tokenMultiplier === null || rolloutPercentage === null) {
    return null
  }

  return {
    id,
    task_type: taskType,
    provider,
    model_name: modelName,
    model_version: readOptionalString(record.model_version),
    fallback_model_name: readOptionalString(record.fallback_model_name),
    fallback_provider: readProvider(record.fallback_provider),
    token_multiplier: tokenMultiplier,
    rollout_percentage: rolloutPercentage,
    is_active: record.is_active === true,
    rolled_out_at: readOptionalString(record.rolled_out_at),
  }
}

export async function fetchAdminModelConfigs(signal?: AbortSignal) {
  const response = await apiClient.request<AdminModelConfigsResponse>('/api/v1/admin/model-config', { signal })
  const payload = response.configs ?? response.data

  return asArray(payload)
    .map(normalizeAdminModelConfig)
    .filter((config): config is AdminModelConfig => Boolean(config))
}

export async function createAdminModelConfig(
  payload: CreateAdminModelConfigPayload,
  signal?: AbortSignal,
) {
  return apiClient.request<unknown>('/api/v1/admin/model-config', {
    method: 'POST',
    body: payload,
    signal,
  })
}

export async function updateAdminModelConfig(
  configId: string,
  payload: UpdateAdminModelConfigPayload,
  signal?: AbortSignal,
) {
  return apiClient.request<unknown>(`/api/v1/admin/model-config/${configId}`, {
    method: 'PATCH',
    body: payload,
    signal,
  })
}
