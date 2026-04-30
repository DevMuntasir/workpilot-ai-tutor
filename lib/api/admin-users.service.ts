import { apiClient } from '@/lib/api/client'

export type AdminUser = {
  id: string
  email: string
  display_name: string | null
  role: string
  is_active: boolean
  plan: string | null
  token_balance: number
  last_login_at: string | null
  created_at: string
}

export type AdminUserSubscription = {
  plan: string | null
  plan_name: string | null
  status: string | null
  billing_interval: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at: string | null
}

export type AdminUserDetails = {
  id: string
  firebase_uid: string | null
  email: string
  display_name: string | null
  role: string
  is_active: boolean
  is_email_verified: boolean
  token_balance: number
  last_login_at: string | null
  created_at: string
  subscription: AdminUserSubscription | null
}

type AdminUsersResponse = {
  data: AdminUser[]
  next_cursor?: string | null
  nextCursor?: string | null
  meta?: {
    next_cursor?: string | null
    nextCursor?: string | null
    has_more?: boolean
  } | null
  pagination?: {
    next_cursor?: string | null
    nextCursor?: string | null
    has_more?: boolean
  } | null
}

export type FetchAdminUsersParams = {
  limit?: number
  cursor?: string | null
  role?: string
  plan?: string
  isActive?: boolean
  search?: string
}

export type FetchAdminUsersResult = {
  data: AdminUser[]
  nextCursor: string | null
}

export type UpdateAdminUserPayload = {
  is_active: boolean
}

export type AdjustAdminCreditsPayload = {
  user_id: string
  amount: number
  reason: string
}

export type ChangeAdminUserPlanPayload = {
  plan_id: string
  billing_interval: 'monthly'
  proration_behavior: 'create_prorations' | 'none'
}

export type AdminUserCreditHistoryEntry = {
  id: string
  event_type: string | null
  amount: number | null
  task_type: string | null
  model_name: string | null
  provider: string | null
  raw_provider_tokens: number | null
  multiplier: number | null
  note: string | null
  created_at: string | null
}

export type AdminUserBillingInvoice = {
  id: string
  status: string | null
  description: string | null
  amount: number | null
  currency: string | null
  hosted_invoice_url: string | null
  invoice_pdf_url: string | null
  created_at: string | null
  paid_at: string | null
}

export type AdminUserBilling = {
  user_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription: {
    id: string | null
    plan_name: string | null
    plan_tier: string | null
    monthly_credit_allotment: number | null
    price_monthly: number | null
    status: string | null
    billing_interval: string | null
    current_period_start: string | null
    current_period_end: string | null
    cancel_at: string | null
    trial_end: string | null
  } | null
  invoices: AdminUserBillingInvoice[]
}

type AdminUserDetailsResponse = {
  data?: AdminUserDetails
} & Partial<AdminUserDetails>

type AdminUserCreditHistoryResponse = {
  data?: unknown
}

type AdminUserBillingResponse = {
  data?: unknown
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
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

function normalizeAdminUserCreditHistoryEntry(value: unknown): AdminUserCreditHistoryEntry | null {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  const id = readString(record.id)

  if (!id) {
    return null
  }

  return {
    id,
    event_type: readString(record.event_type),
    amount: readNumber(record.amount),
    task_type: readString(record.task_type),
    model_name: readString(record.model_name),
    provider: readString(record.provider),
    raw_provider_tokens: readNumber(record.raw_provider_tokens),
    multiplier: readNumber(record.multiplier),
    note: readString(record.note),
    created_at: readString(record.created_at),
  }
}

function normalizeAdminUserBillingInvoice(value: unknown, index: number): AdminUserBillingInvoice | null {
  const record = asRecord(value)

  if (!record) {
    return null
  }

  const createdAt =
    readString(record.created_at) ??
    readString(record.date) ??
    readString(record.invoice_date) ??
    readString(record.period_start)

  return {
    id: readString(record.id) ?? `invoice-${createdAt ?? index}`,
    status: readString(record.status),
    description: readString(record.description),
    amount:
      readNumber(record.amount_paid) ??
      readNumber(record.amount_due) ??
      readNumber(record.total) ??
      readNumber(record.amount),
    currency: readString(record.currency),
    hosted_invoice_url: readString(record.hosted_invoice_url) ?? readString(record.invoice_url),
    invoice_pdf_url: readString(record.invoice_pdf) ?? readString(record.invoice_pdf_url),
    created_at: createdAt,
    paid_at: readString(record.paid_at) ?? readString(record.status_transitions_paid_at),
  }
}

function extractNextCursor(response: AdminUsersResponse) {
  return (
    response.next_cursor ??
    response.nextCursor ??
    response.meta?.next_cursor ??
    response.meta?.nextCursor ??
    response.pagination?.next_cursor ??
    response.pagination?.nextCursor ??
    null
  )
}

export async function fetchAdminUsers(
  params: FetchAdminUsersParams = {},
  signal?: AbortSignal,
): Promise<FetchAdminUsersResult> {
  const searchParams = new URLSearchParams()

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit))
  }

  if (params.cursor) {
    searchParams.set('cursor', params.cursor)
  }

  if (params.role) {
    searchParams.set('role', params.role)
  }

  if (params.plan) {
    searchParams.set('plan', params.plan)
  }

  if (typeof params.isActive === 'boolean') {
    searchParams.set('is_active', String(params.isActive))
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  const query = searchParams.toString()
  const response = await apiClient.request<AdminUsersResponse>(
    `/api/v1/admin/users${query ? `?${query}` : ''}`,
    { signal },
  )

  return {
    data: Array.isArray(response.data) ? response.data : [],
    nextCursor: extractNextCursor(response),
  }
}

export async function fetchAdminUserDetails(userId: string, signal?: AbortSignal): Promise<AdminUserDetails> {
  const response = await apiClient.request<AdminUserDetailsResponse>(`/api/v1/admin/users/${userId}`, { signal })
  const payload = response.data ?? response

  return {
    id: payload.id,
    firebase_uid: payload.firebase_uid ?? null,
    email: payload.email,
    display_name: payload.display_name ?? null,
    role: payload.role,
    is_active: payload.is_active,
    is_email_verified: payload.is_email_verified,
    token_balance: payload.token_balance,
    last_login_at: payload.last_login_at ?? null,
    created_at: payload.created_at,
    subscription: payload.subscription
      ? {
          plan: payload.subscription.plan ?? null,
          plan_name: payload.subscription.plan_name ?? null,
          status: payload.subscription.status ?? null,
          billing_interval: payload.subscription.billing_interval ?? null,
          stripe_customer_id: payload.subscription.stripe_customer_id ?? null,
          stripe_subscription_id: payload.subscription.stripe_subscription_id ?? null,
          current_period_start: payload.subscription.current_period_start ?? null,
          current_period_end: payload.subscription.current_period_end ?? null,
          cancel_at: payload.subscription.cancel_at ?? null,
        }
      : null,
  }
}

export async function updateAdminUser(userId: string, payload: UpdateAdminUserPayload, signal?: AbortSignal) {
  return apiClient.request<unknown>(`/api/v1/admin/users/${userId}`, {
    method: 'PATCH',
    body: payload,
    signal,
  })
}

export async function adjustAdminCredits(payload: AdjustAdminCreditsPayload, signal?: AbortSignal) {
  return apiClient.request<unknown>('/api/v1/admin/credits/adjust', {
    method: 'POST',
    body: payload,
    signal,
  })
}

export async function changeAdminUserPlan(
  userId: string,
  payload: ChangeAdminUserPlanPayload,
  signal?: AbortSignal,
) {
  return apiClient.request<unknown>(`/api/v1/admin/users/${userId}/billing/change-plan`, {
    method: 'POST',
    body: payload,
    signal,
  })
}

export async function cancelAdminUserSubscription(userId: string, signal?: AbortSignal) {
  return apiClient.request<unknown>(`/api/v1/admin/users/${userId}/cancel-subscription`, {
    method: 'POST',
    signal,
  })
}

export async function fetchAdminUserCreditHistory(userId: string, signal?: AbortSignal) {
  const response = await apiClient.request<AdminUserCreditHistoryResponse>(`/api/v1/admin/users/${userId}/credits/history`, {
    signal,
  })

  return asArray(response?.data)
    .map(normalizeAdminUserCreditHistoryEntry)
    .filter((entry): entry is AdminUserCreditHistoryEntry => Boolean(entry))
}

export async function fetchAdminUserBilling(userId: string, signal?: AbortSignal): Promise<AdminUserBilling> {
  const response = await apiClient.request<AdminUserBillingResponse>(`/api/v1/admin/users/${userId}/billing`, {
    signal,
  })

  const root = asRecord(response)
  const payload = asRecord(root?.data) ?? root
  const subscriptionRecord = asRecord(payload?.subscription)
  const planRecord = asRecord(subscriptionRecord?.plan)

  return {
    user_id: readString(payload?.user_id),
    stripe_customer_id: readString(payload?.stripe_customer_id),
    stripe_subscription_id: readString(payload?.stripe_subscription_id),
    subscription: subscriptionRecord
      ? {
          id: readString(subscriptionRecord.id),
          plan_name: readString(planRecord?.name),
          plan_tier: readString(planRecord?.tier),
          monthly_credit_allotment: readNumber(planRecord?.monthly_credit_allotment),
          price_monthly: readNumber(planRecord?.price_monthly),
          status: readString(subscriptionRecord.status),
          billing_interval: readString(subscriptionRecord.billing_interval),
          current_period_start: readString(subscriptionRecord.current_period_start),
          current_period_end: readString(subscriptionRecord.current_period_end),
          cancel_at: readString(subscriptionRecord.cancel_at),
          trial_end: readString(subscriptionRecord.trial_end),
        }
      : null,
    invoices: asArray(payload?.invoices)
      .map(normalizeAdminUserBillingInvoice)
      .filter((invoice): invoice is AdminUserBillingInvoice => Boolean(invoice)),
  }
}
