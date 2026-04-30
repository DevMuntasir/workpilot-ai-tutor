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

type AdminUserDetailsResponse = {
  data?: AdminUserDetails
} & Partial<AdminUserDetails>

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
