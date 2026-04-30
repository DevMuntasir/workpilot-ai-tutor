import { apiClient } from '@/lib/api/client'

type AdminPlansResponse = {
  data?: unknown
}

type ApiRecord = Record<string, unknown>

export type AdminPlan = {
  id: string
  code: string
  name: string
  monthlyCreditAllotment: number | null
  priceMonthly: number | null
  stripeProductId: string | null
  stripeMonthlyPriceId: string | null
  isActive: boolean
  createdAt: string | null
}

function asRecord(value: unknown): ApiRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as ApiRecord) : null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeAdminPlan(value: unknown): AdminPlan | null {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  const id = readString(record.id)
  const code = readString(record.code)
  const name = readString(record.name)

  if (!id || !code || !name) {
    return null
  }

  return {
    id,
    code,
    name,
    monthlyCreditAllotment: readNumber(record.monthly_credit_allotment),
    priceMonthly: readNumber(record.price_monthly),
    stripeProductId: readString(record.stripe_product_id),
    stripeMonthlyPriceId: readString(record.stripe_monthly_price_id),
    isActive: record.is_active === true,
    createdAt: readString(record.created_at),
  }
}

export async function fetchAdminPlans(signal?: AbortSignal) {
  const response = await apiClient.request<AdminPlansResponse>('/api/v1/admin/plans', { signal })

  return asArray(response?.data)
    .map(normalizeAdminPlan)
    .filter((plan): plan is AdminPlan => Boolean(plan))
}
