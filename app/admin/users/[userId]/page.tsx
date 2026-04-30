'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { ArrowLeft, CalendarClock, Coins, MailCheck, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAdminUserDetails, getApiClientErrorMessage, type AdminUserDetails } from '@/lib/api'

function formatDateTime(value: string | null) {
  if (!value) {
    return 'N/A'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatLabel(value: string | null) {
  if (!value) {
    return 'N/A'
  }

  return value
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusTone(isPositive: boolean) {
  return isPositive
    ? 'border-emerald-200 bg-emerald-500/10 text-emerald-700'
    : 'border-slate-200 bg-slate-500/10 text-slate-700'
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  icon: typeof UserRound
}) {
  return (
    <div className=" border border-white/70 bg-white/80 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </p>
          <div className="mt-3 text-lg font-semibold text-foreground">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: React.ReactNode
  emphasize?: boolean
}) {
  return (
    <div className="transition-colors hover:border-primary/20 hover:bg-background">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div
        className={`mt-1 break-all ${
          emphasize ? 'text-sm font-semibold text-foreground' : 'text-sm font-medium text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

export default function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = use(params)
  const [user, setUser] = useState<AdminUserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!userId) {
      return
    }

    const abortController = new AbortController()

    async function loadUserDetails() {
      setErrorMessage('')
      setIsLoading(true)

      try {
        const response = await fetchAdminUserDetails(userId, abortController.signal)
        setUser(response)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        setUser(null)
        setErrorMessage(getApiClientErrorMessage(error, 'Failed to load user details.'))
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadUserDetails()

    return () => {
      abortController.abort()
    }
  }, [reloadKey, userId])

  return (
    <section className="p-4 md:p-6">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4" />
                Back to users
              </Link>
            </Button>

          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsRefreshing(true)
              setReloadKey((current) => current + 1)
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <Card >
            <CardContent className="px-6 py-16 text-center text-muted-foreground">
              Loading user details...
            </CardContent>
          </Card>
        ) : user ? (
          <div className="space-y-6">
            <div className="overflow-hidden  border border-border/70 bg-[linear-gradient(135deg,rgba(91,101,224,0.14),rgba(159,203,152,0.1)_42%,rgba(255,255,255,0.92)_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="gap-6 p-6 lg:p-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-white/90 text-primary shadow-[0_16px_50px_rgba(91,101,224,0.18)]">
                      <UserRound className="h-10 w-10" />
                    </div>
                    <div className="min-w-0 space-y-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                          Account Snapshot
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                          {user.display_name?.trim() || 'Unnamed user'}
                        </h1>
                        <p className="mt-2 break-all text-sm text-muted-foreground md:text-base">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge variant="outline" className="rounded-full px-3 py-1 capitalize">
                          {user.role}
                        </Badge>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(
                            user.is_active,
                          )}`}
                        >
                          {user.is_active ? 'Active account' : 'Inactive account'}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(
                            user.is_email_verified,
                          )}`}
                        >
                          {user.is_email_verified ? 'Verified email' : 'Unverified email'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <StatTile label="Token Balance" value={user.token_balance} icon={Coins} />
                    <StatTile label="Last Login" value={formatDateTime(user.last_login_at)} icon={CalendarClock} />
                    <StatTile
                      label="Subscription"
                      value={user.subscription?.plan_name || formatLabel(user.subscription?.plan ?? null)}
                      icon={ShieldCheck}
                    />
                  </div>
                </div>

          
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <Card className="border-border/70 shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
                <CardHeader className="border-b !pb-2">
                  <CardTitle className="text-xl">Access and Identity</CardTitle>
                  {/* <CardDescription>
                    Core user fields used for authentication, ownership, and audit history.
                  </CardDescription> */}
                </CardHeader>
                <CardContent className="grid gap-3  md:grid-cols-2">
                  <DetailRow label="Display Name" value={user.display_name?.trim() || 'Unnamed user'} emphasize />
                  <DetailRow label="Email" value={user.email} emphasize />
                  <DetailRow label="Role" value={formatLabel(user.role)} />
                  <DetailRow
                    label="Email Verification"
                    value={
                      <span className="inline-flex items-center gap-2">
                        <MailCheck className="h-4 w-4 text-primary" />
                        {user.is_email_verified ? 'Verified' : 'Not verified'}
                      </span>
                    }
                  />
                  {/* <DetailRow label="User ID" value={user.id} /> */}
                  {/* <DetailRow label="Firebase UID" value={user.firebase_uid || 'N/A'} /> */}
                  <DetailRow label="Last Login" value={formatDateTime(user.last_login_at)} />
                  <DetailRow label="Created At" value={formatDateTime(user.created_at)} />
                </CardContent>
              </Card>

              <Card className=" border-border/70 shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
                <CardHeader className="border-b !pb-2">
                  <CardTitle className="text-xl">Subscription and Billing</CardTitle>
                  {/* <CardDescription>
                    Plan state, billing cycle, and linked Stripe references for this account.
                  </CardDescription> */}
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <DetailRow
                    label="Plan"
                    value={user.subscription?.plan_name || formatLabel(user.subscription?.plan ?? null)}
                    emphasize
                  />
                  <DetailRow
                    label="Status"
                    value={
                      <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold">
                        {formatLabel(user.subscription?.status ?? null)}
                      </span>
                    }
                  />
                  <DetailRow label="Billing Interval" value={formatLabel(user.subscription?.billing_interval ?? null)} />
                  <DetailRow label="Token Balance" value={user.token_balance} />
                  <DetailRow
                    label="Current Period Start"
                    value={formatDateTime(user.subscription?.current_period_start ?? null)}
                  />
                  <DetailRow
                    label="Current Period End"
                    value={formatDateTime(user.subscription?.current_period_end ?? null)}
                  />
                  {/* <DetailRow label="Cancel At" value={formatDateTime(user.subscription?.cancel_at ?? null)} /> */}
                  <DetailRow label="Stripe Customer ID" value={user.subscription?.stripe_customer_id || 'N/A'} />
                  <DetailRow
                    label="Stripe Subscription ID"
                    value={user.subscription?.stripe_subscription_id || 'N/A'}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="">
            <CardContent className="px-6 py-16 text-center">
              <p className="font-medium text-foreground">User details unavailable</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The selected account could not be loaded from the admin API.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
