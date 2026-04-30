'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { ArrowLeft, CalendarClock, Coins, LoaderCircle, MailCheck, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  cancelAdminUserSubscription,
  changeAdminUserPlan,
  fetchAdminPlans,
  fetchAdminUserBilling,
  fetchAdminUserCreditHistory,
  fetchAdminUserDetails,
  getApiClientErrorMessage,
  type AdminUserBilling,
  type AdminPlan,
  type AdminUserCreditHistoryEntry,
  type AdminUserDetails,
} from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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

function formatNumber(value: number | null) {
  if (value === null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US').format(value)
}

function formatCurrency(value: number | null, currency = 'USD') {
  if (value === null) {
    return 'N/A'
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value)
  } catch {
    return `${value} ${currency}`
  }
}

function getCreditEventTone(eventType: string | null) {
  const normalized = eventType?.toLowerCase() ?? ''

  if (normalized.includes('debit')) {
    return 'border-amber-200 bg-amber-500/10 text-amber-700'
  }

  if (normalized.includes('credit')) {
    return 'border-emerald-200 bg-emerald-500/10 text-emerald-700'
  }

  return 'border-slate-200 bg-slate-500/10 text-slate-700'
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
  const { toast } = useToast()
  const { userId } = use(params)
  const [user, setUser] = useState<AdminUserDetails | null>(null)
  const [billing, setBilling] = useState<AdminUserBilling | null>(null)
  const [creditHistory, setCreditHistory] = useState<AdminUserCreditHistoryEntry[]>([])
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [isPlansLoading, setIsPlansLoading] = useState(false)
  const [isPlanChangeSubmitting, setIsPlanChangeSubmitting] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false)
  const [planFormError, setPlanFormError] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [selectedProrationBehavior, setSelectedProrationBehavior] = useState<'create_prorations' | 'none'>(
    'create_prorations',
  )

  const activePlans = plans.filter((plan) => plan.isActive)
  const currentPlanId = user?.subscription?.plan ? activePlans.find((plan) => plan.code === user.subscription?.plan)?.id : null
  const canCancelSubscription =
    Boolean(user?.subscription?.stripe_subscription_id || user?.subscription?.plan || user?.subscription?.plan_name) &&
    user?.subscription?.status?.toLowerCase() !== 'canceled'

  useEffect(() => {
    if (!userId) {
      return
    }

    const abortController = new AbortController()

    async function loadUserDetails() {
      setErrorMessage('')
      setIsLoading(true)

      try {
        const [userDetails, userCreditHistory, userBilling] = await Promise.all([
          fetchAdminUserDetails(userId, abortController.signal),
          fetchAdminUserCreditHistory(userId, abortController.signal),
          fetchAdminUserBilling(userId, abortController.signal),
        ])
        setUser(userDetails)
        setCreditHistory(userCreditHistory)
        setBilling(userBilling)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        setUser(null)
        setBilling(null)
        setCreditHistory([])
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

  useEffect(() => {
    if (!isPlanDialogOpen) {
      setPlanFormError('')
      return
    }

    if (selectedPlanId) {
      return
    }

    setSelectedPlanId(currentPlanId ?? '')
  }, [currentPlanId, isPlanDialogOpen, selectedPlanId])

  const handleOpenPlanDialog = async () => {
    setPlanFormError('')
    setSelectedPlanId(currentPlanId ?? '')
    setSelectedProrationBehavior('create_prorations')
    setIsPlanDialogOpen(true)

    if (plans.length > 0) {
      return
    }

    setIsPlansLoading(true)

    try {
      const availablePlans = await fetchAdminPlans()
      setPlans(availablePlans)
    } catch (error) {
      setPlanFormError(getApiClientErrorMessage(error, 'Failed to load plans.'))
    } finally {
      setIsPlansLoading(false)
    }
  }

  const handleSubmitPlanChange = async () => {
    if (!selectedPlanId) {
      setPlanFormError('Please select a subscription plan.')
      return
    }

    setPlanFormError('')
    setIsPlanChangeSubmitting(true)

    try {
      await changeAdminUserPlan(userId, {
        plan_id: selectedPlanId,
        billing_interval: 'monthly',
        proration_behavior: selectedProrationBehavior,
      })

      toast({
        title: 'Plan updated',
        description: 'The user subscription plan was changed successfully.',
      })

      setIsPlanDialogOpen(false)
      setReloadKey((current) => current + 1)
    } catch (error) {
      setPlanFormError(getApiClientErrorMessage(error, 'Failed to change the subscription plan.'))
    } finally {
      setIsPlanChangeSubmitting(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelSubmitting(true)

    try {
      await cancelAdminUserSubscription(userId)

      toast({
        title: 'Subscription canceled',
        description: 'The user subscription was canceled successfully.',
      })

      setIsCancelDialogOpen(false)
      setReloadKey((current) => current + 1)
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: getApiClientErrorMessage(error, 'Failed to cancel the subscription.'),
        variant: 'destructive',
      })
    } finally {
      setIsCancelSubmitting(false)
    }
  }

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
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/credits?userId=${user.id}`}>
                            <Coins className="h-4 w-4" />
                            Adjust credits
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void handleOpenPlanDialog()}>
                          <ShieldCheck className="h-4 w-4" />
                          Change plan
                        </Button>
                        {canCancelSubscription ? (
                          <Button variant="outline" size="sm" onClick={() => setIsCancelDialogOpen(true)}>
                            Cancel subscription
                          </Button>
                        ) : null}
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

            <Card className="border-border/70 shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
              <CardHeader className="border-b !pb-2">
                <CardTitle className="text-xl">Billing Invoices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <DetailRow label="Stripe Customer ID" value={billing?.stripe_customer_id || 'N/A'} />
                  <DetailRow label="Billing Status" value={formatLabel(billing?.subscription?.status ?? null)} />
                  <DetailRow
                    label="Monthly Price"
                    value={formatCurrency(billing?.subscription?.price_monthly ?? null)}
                  />
                  <DetailRow
                    label="Monthly Credits"
                    value={billing?.subscription?.monthly_credit_allotment ?? 'N/A'}
                  />
                </div>

                {billing?.invoices.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Links</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billing.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{formatLabel(invoice.status)}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount, invoice.currency ?? 'USD')}</TableCell>
                          <TableCell className="max-w-sm whitespace-normal break-words text-sm">
                            {invoice.description || 'N/A'}
                          </TableCell>
                          <TableCell>{formatDateTime(invoice.created_at)}</TableCell>
                          <TableCell>{formatDateTime(invoice.paid_at)}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {invoice.hosted_invoice_url ? (
                                <Button asChild variant="outline" size="sm">
                                  <a href={invoice.hosted_invoice_url} target="_blank" rel="noreferrer">
                                    View invoice
                                  </a>
                                </Button>
                              ) : null}
                              {invoice.invoice_pdf_url ? (
                                <Button asChild variant="outline" size="sm">
                                  <a href={invoice.invoice_pdf_url} target="_blank" rel="noreferrer">
                                    PDF
                                  </a>
                                </Button>
                              ) : null}
                              {!invoice.hosted_invoice_url && !invoice.invoice_pdf_url ? 'N/A' : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center text-sm text-muted-foreground">
                    No billing invoices found for this user.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/70 shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
              <CardHeader className="border-b !pb-2">
                <CardTitle className="text-xl">Credit History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {creditHistory.length === 0 ? (
                  <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No credit history found for this user.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Tokens</TableHead>
                        <TableHead>Multiplier</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="min-w-80 whitespace-normal">Note</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditHistory.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getCreditEventTone(
                                entry.event_type,
                              )}`}
                            >
                              {formatLabel(entry.event_type)}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{entry.amount ?? 'N/A'}</TableCell>
                          <TableCell>{formatLabel(entry.task_type)}</TableCell>
                          <TableCell>{entry.provider ? formatLabel(entry.provider) : 'N/A'}</TableCell>
                          <TableCell>{formatNumber(entry.raw_provider_tokens)}</TableCell>
                          <TableCell>{entry.multiplier ?? 'N/A'}</TableCell>
                          <TableCell>{formatDateTime(entry.created_at)}</TableCell>
                          <TableCell className="max-w-xl whitespace-normal break-words text-xs leading-5 text-muted-foreground">
                            {entry.note || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
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

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Update this user&apos;s subscription to another active monthly plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select
                value={selectedPlanId}
                onValueChange={setSelectedPlanId}
                disabled={isPlansLoading || isPlanChangeSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isPlansLoading ? 'Loading plans...' : 'Select a plan'} />
                </SelectTrigger>
                <SelectContent>
                  {activePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proration behavior</Label>
              <Select
                value={selectedProrationBehavior}
                onValueChange={(value) => setSelectedProrationBehavior(value as 'create_prorations' | 'none')}
                disabled={isPlanChangeSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select proration behavior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="create_prorations">Create prorations</SelectItem>
                  <SelectItem value="none">No proration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Billing interval is fixed to <span className="font-medium text-foreground">monthly</span> for this
              action.
            </div>

            {planFormError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {planFormError}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPlanDialogOpen(false)}
              disabled={isPlanChangeSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmitPlanChange()}
              disabled={isPlansLoading || isPlanChangeSubmitting || !selectedPlanId || selectedPlanId === currentPlanId}
            >
              {isPlanChangeSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Save plan change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the current subscription for this user. Use this only when you intend to stop the
              active plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelSubmitting}>Keep subscription</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelSubmitting}
              onClick={(event) => {
                event.preventDefault()
                void handleCancelSubscription()
              }}
            >
              {isCancelSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Confirm cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
